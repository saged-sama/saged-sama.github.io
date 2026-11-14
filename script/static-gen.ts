/**
 * Syncs the portfolio from portfolio-admin, then refreshes the GitHub profile.
 *
 *   node script/static-gen.ts            sync for real
 *   node script/static-gen.ts --dry-run  print what would change, write nothing
 *
 * 1. Fetch every public record (publishable API key, read-only).
 * 2. Turn them into files under data/, blogs/, images/ and public/media/.
 * 3. Add / update / delete only files the sync wrote itself and nobody edited since
 *    (see .sync/manifest.json). Hand-written files are never touched.
 * 4. Regenerate the marked blocks of the profile README (PROFILE_README).
 * 5. Update the GitHub profile's name, bio, website, location, company (GH_PROFILE_TOKEN).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createApi } from './lib/api.ts';
import { readEnv } from './lib/env.ts';
import { profileFields, updateGithubProfile } from './lib/github-profile.ts';
import { readLocal } from './lib/local.ts';
import { printPlan, step } from './lib/log.ts';
import { loadManifest, saveManifest } from './lib/manifest.ts';
import { createMedia } from './lib/media.ts';
import { readmeSections, replaceSections } from './lib/readme.ts';
import { KINDS, desiredFiles } from './lib/registry.ts';
import { applySync, planSync, shaOnDisk } from './lib/sync.ts';
import { createCtx } from './lib/transforms/util.ts';

const env = readEnv(process.argv.slice(2));
const api = createApi(env);

step(`Fetching from ${new URL(env.pbUrl).host}`);
const media = createMedia(api);
const ctx = createCtx(media, api.mediaUrlPrefix);
const perKind = await Promise.all(KINDS.map((kind) => desiredFiles(kind, api, ctx)));
for (const [i, files] of perKind.entries()) console.log(`  ${KINDS[i].collection.padEnd(14)} ${files.length}`);

// Without the profile the key is wrong or the portfolio is private: syncing now would delete
// everything, so stop instead.
if (!perKind[KINDS.findIndex((k) => k.single)].length) {
	throw new Error('No public profile came back. Is the portfolio public and the API key active?');
}

step('Planning');
const desired = [...perKind.flat(), ...media.desired()];
const manifest = loadManifest(env.root);
const actions = planSync(desired, manifest, shaOnDisk(env.root));
printPlan(actions, env.dryRun);

if (!env.dryRun) {
	await applySync(env.root, actions, desired, manifest);
	saveManifest(env.root, manifest);
}

const local = readLocal(env.root);

step('Profile README');
if (!env.profileReadme) console.log('  PROFILE_README not set, skipping.');
else if (!existsSync(env.profileReadme)) console.log(`  ${env.profileReadme} not found, skipping.`);
else {
	const before = readFileSync(env.profileReadme, 'utf8');
	const { text, found } = replaceSections(before, readmeSections(local, env.siteUrl));
	if (!found.length) console.log('  No <!-- portfolio:… --> markers found, nothing to update.');
	else if (text === before) console.log(`  Up to date (${found.join(', ')}).`);
	else {
		if (!env.dryRun) writeFileSync(env.profileReadme, text);
		console.log(`  ${env.dryRun ? 'Would update' : 'Updated'}: ${found.join(', ')}`);
	}
}

step('GitHub profile');
if (!env.githubToken) console.log('  GH_PROFILE_TOKEN not set, skipping.');
else {
	const changed = await updateGithubProfile(env.githubToken, profileFields(local, env.siteUrl), env.dryRun);
	console.log(changed.length ? `  ${env.dryRun ? 'Would update' : 'Updated'}: ${changed.join(', ')}` : '  Up to date.');
}
if (env.dryRun) console.log('\nDry run: nothing was written.');
