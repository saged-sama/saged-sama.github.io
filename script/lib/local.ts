import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, extname, resolve, sep } from 'node:path';
import { parse } from 'yaml';

/**
 * Reads the site's content as it is on disk after the sync, hand-written files included, so the
 * README and GitHub profile describe exactly what the site shows. Only the fields they need.
 */
type Entry = Record<string, unknown> & { slug: string };

/**
 * Every file with this extension in `folder` and its sub-folders. `slug` is the path without the
 * extension ("machine-learning/intro"), which is also the page's URL path.
 */
function read(root: string, folder: string, ext: '.json' | '.md'): Entry[] {
	const dir = resolve(root, folder);
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { recursive: true, encoding: 'utf8' })
		.filter((f) => extname(f) === ext && !basename(f).startsWith('_'))
		.map((f) => {
			const text = readFileSync(resolve(dir, f), 'utf8');
			const data = ext === '.json' ? JSON.parse(text) : frontmatter(text);
			return { ...data, slug: f.slice(0, -ext.length).split(sep).join('/').toLowerCase() };
		});
}

function frontmatter(text: string): Record<string, unknown> {
	const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
	return match ? ((parse(match[1]) as Record<string, unknown>) ?? {}) : {};
}

const visible = (e: Entry) => e.draft !== true;
const time = (value: unknown) => (value ? new Date(String(value)).getTime() : 0);

export function readLocal(root: string) {
	const profileFile = resolve(root, 'data/profile.json');
	return {
		profile: existsSync(profileFile)
			? (JSON.parse(readFileSync(profileFile, 'utf8')) as Record<string, unknown>)
			: {},
		/** Newest first. */
		posts: read(root, 'blogs', '.md')
			.filter(visible)
			.sort((a, b) => time(b.date) - time(a.date)),
		/** Featured first, then by order. */
		projects: read(root, 'data/projects', '.md')
			.filter(visible)
			.sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || Number(a.order ?? 0) - Number(b.order ?? 0)),
		skills: read(root, 'data/skills', '.json'),
		experience: read(root, 'data/experience', '.json')
	};
}

export type Local = ReturnType<typeof readLocal>;
