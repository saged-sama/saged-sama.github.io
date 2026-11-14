import type { Local } from './local.ts';

const API = 'https://api.github.com/user';
const BIO_MAX = 160;

type Fields = { name?: string; bio?: string; blog?: string; location?: string; company?: string; hireable?: boolean };

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

/** Profile fields from the site's data. Empty values are left out, so they're never cleared. */
export function profileFields(local: Local, siteUrl: string): Fields {
	const p = local.profile;
	const current = local.experience.find((e) => e.current === true);
	const bio = text(p.shortBio) ?? text(p.headline);
	return {
		name: text(p.name),
		bio: bio && bio.length > BIO_MAX ? `${bio.slice(0, BIO_MAX - 1)}…` : bio,
		blog: siteUrl,
		location: text(p.location),
		company: text((current?.organization as { name?: string } | undefined)?.name),
		hireable: p.openToWork === true
	};
}

/** Updates only the fields that differ from what GitHub has. Returns the changed field names. */
export async function updateGithubProfile(token: string, fields: Fields, dryRun: boolean) {
	const headers = {
		authorization: `Bearer ${token}`,
		accept: 'application/vnd.github+json',
		'x-github-api-version': '2022-11-28'
	};
	const res = await fetch(API, { headers });
	if (!res.ok) throw new Error(`GitHub: reading the profile failed (${res.status}). Check GH_PROFILE_TOKEN.`);
	const current = (await res.json()) as Record<string, unknown>;

	const changes = Object.fromEntries(
		Object.entries(fields).filter(([key, value]) => value !== undefined && (current[key] ?? '') !== value)
	);
	if (dryRun || !Object.keys(changes).length) return Object.keys(changes);

	const update = await fetch(API, {
		method: 'PATCH',
		headers: { ...headers, 'content-type': 'application/json' },
		body: JSON.stringify(changes)
	});
	if (!update.ok) throw new Error(`GitHub: updating the profile failed (${update.status}): ${await update.text()}`);
	return Object.keys(changes);
}
