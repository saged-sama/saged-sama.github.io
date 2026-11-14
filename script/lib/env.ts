import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type Env = {
	/** Repo root; every path the script writes is relative to it. */
	root: string;
	pbUrl: string;
	apiKey: string;
	siteUrl: string;
	/** Path to the profile repo's README (the `saged-sama` checkout). Skipped when unset. */
	profileReadme?: string;
	/** Fine-grained token for the GitHub profile update. Skipped when unset. */
	githubToken?: string;
	/** Plan and print, but write nothing. */
	dryRun: boolean;
};

/** Loads `.env` (if present) without overriding variables that are already set, e.g. in CI. */
function loadDotEnv(root: string) {
	const file = resolve(root, '.env');
	if (!existsSync(file)) return;
	for (const line of readFileSync(file, 'utf8').split('\n')) {
		const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
		if (!match || process.env[match[1]] !== undefined) continue;
		process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
	}
}

export function readEnv(argv: string[], root = process.cwd()): Env {
	loadDotEnv(root);
	const required = (name: string) => {
		const value = process.env[name]?.trim();
		if (!value) throw new Error(`Missing ${name}. Set it in .env locally or as a repo secret.`);
		return value;
	};
	const optional = (name: string) => process.env[name]?.trim() || undefined;
	const readme = optional('PROFILE_README');
	return {
		root,
		pbUrl: required('POCKETBASE_URL').replace(/\/+$/, ''),
		apiKey: required('POCKETBASE_API_KEY'),
		siteUrl: (optional('SITE_URL') ?? 'https://saged-sama.github.io').replace(/\/+$/, ''),
		profileReadme: readme ? resolve(root, readme) : undefined,
		githubToken: optional('GH_PROFILE_TOKEN'),
		dryRun: argv.includes('--dry-run')
	};
}
