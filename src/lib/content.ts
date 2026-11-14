import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from 'astro:content';

/**
 * Content getters for pages: everything already sorted the way the site shows it.
 * (getCollection's order is undefined, so nothing should rely on it directly.)
 */

type Listed = { data: { featured: boolean; order: number } };
type Dated = { data: { start?: Date; date?: Date; issued?: Date } };

const time = (e: Dated) => (e.data.start ?? e.data.date ?? e.data.issued)?.getTime() ?? 0;

/** By `order` (lower first), then newest first. */
const byOrderThenDate = (a: Listed & Dated, b: Listed & Dated) => a.data.order - b.data.order || time(b) - time(a);

/** Featured items first, keeping the order above. */
export const featuredFirst = <T extends Listed>(items: T[]) =>
	[...items].sort((a, b) => Number(b.data.featured) - Number(a.data.featured));

export async function profile() {
	const entry = await getEntry('profile', 'profile');
	if (!entry) throw new Error('data/profile.json is missing.');
	return entry.data;
}

/** Any list collection, sorted by order then date. */
export async function list<C extends Exclude<CollectionKey, 'profile' | 'blog' | 'projects'>>(name: C) {
	const items = (await getCollection(name)) as CollectionEntry<C>[];
	return items.sort((a, b) => byOrderThenDate(a as never, b as never));
}

/** Published posts, newest first. Drafts only show in `astro dev`. */
export async function posts() {
	const items = await getCollection('blog', (p) => import.meta.env.DEV || !p.data.draft);
	return items.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Projects, featured first, then by order and date. */
export async function projects() {
	const items = await getCollection('projects', (p) => import.meta.env.DEV || !p.data.draft);
	return featuredFirst(items.sort(byOrderThenDate));
}

/** Skills grouped by category, groups in order of their first skill. */
export async function skillGroups() {
	const groups = new Map<string, CollectionEntry<'skills'>[]>();
	for (const skill of await list('skills')) {
		const group = groups.get(skill.data.category) ?? [];
		groups.set(skill.data.category, [...group, skill]);
	}
	return [...groups].map(([category, skills]) => ({ category, skills }));
}
