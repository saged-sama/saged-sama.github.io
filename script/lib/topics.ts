import type { PbRecord } from './api.ts';

/**
 * Blog topics. The admin stores a post's topic as a path of names ("Machine Learning / Linear
 * Models"); here each level becomes a folder under blogs/ (blogs/machine-learning/linear-models/).
 * Folder names can't keep the exact wording, so each topic folder also gets a `_meta.json` with
 * its display name.
 */

/** The levels of a topic path, trimmed, empty levels dropped. */
export function topicSegments(path: unknown): string[] {
	return String(path ?? '')
		.split('/')
		.map((s) => s.replace(/\s+/g, ' ').trim())
		.filter(Boolean);
}

/** A folder name for one level. Keeps letters of any script (e.g. Bangla), not just a–z. */
export function topicSlug(name: string): string {
	return (
		name
			.normalize('NFKC')
			.toLowerCase()
			.replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 60) || 'topic'
	);
}

/** The folder path of a post's topic, e.g. "machine-learning/linear-models" ('' = top level). */
export const topicFolder = (record: PbRecord) => topicSegments(record.topic).map(topicSlug).join('/');

/** `_meta.json` files (path → label) for every topic level the posts use. */
export function topicMetas(records: PbRecord[], root: string): Map<string, { label: string }> {
	const metas = new Map<string, { label: string }>();
	for (const record of records) {
		const segments = topicSegments(record.topic);
		segments.forEach((label, i) => {
			const folder = segments.slice(0, i + 1).map(topicSlug).join('/');
			const path = `${root}/${folder}/_meta.json`;
			// The first spelling wins when two posts write a topic differently ("ML" vs "ml").
			if (!metas.has(path)) metas.set(path, { label });
		});
	}
	return metas;
}
