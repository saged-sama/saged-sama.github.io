import { stringify } from 'yaml';
import type { Api } from './api.ts';
import { sha } from './manifest.ts';
import type { Desired } from './sync.ts';
import type { Kind } from './transforms/kind.ts';
import { achievements, education, experience } from './transforms/career.ts';
import { posts, projects } from './transforms/content.ts';
import { lifeEvents, skills, testimonials } from './transforms/extras.ts';
import { profile, social } from './transforms/profile.ts';
import { clean, type Ctx } from './transforms/util.ts';

/** Every admin collection the site shows, and where its files go. */
export const KINDS: Kind[] = [
	profile,
	social,
	skills,
	experience,
	education,
	achievements,
	testimonials,
	lifeEvents,
	projects,
	posts
];

function serialize(kind: Kind, data: object, body = '') {
	if (kind.format === 'json') return JSON.stringify(data, null, 2) + '\n';
	return `---\n${stringify(data, { lineWidth: 0 })}---\n\n${body}\n`;
}

/** Fetches one collection and turns each record into the file it should become. */
export async function desiredFiles(kind: Kind, api: Api, ctx: Ctx): Promise<Desired[]> {
	let records = await api.list(kind.collection, kind.expand);
	if (kind.single) records = records.slice(0, 1);

	const taken = new Set<string>();
	return records.map((record) => {
		let name = kind.name(record);
		if (taken.has(name)) name = `${name}-${record.id}`;
		taken.add(name);

		const path = `${kind.folder}/${name}.${kind.format}`;
		const { data, body } = kind.build(record, ctx, path);
		const content = serialize(kind, clean(data), body);
		return { path, version: sha(content), load: async () => content };
	});
}
