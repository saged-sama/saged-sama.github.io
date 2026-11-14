import { getCollection, type CollectionEntry } from 'astro:content';
import { posts } from './content';

/**
 * The blog as a tree of topics, from the folder structure under blogs/. A topic's name comes from
 * its `_meta.json` (written by the sync, or by hand), else from the folder name.
 */

export type Post = CollectionEntry<'blog'>;

export type Topic = {
	/** URL path below /blog/, e.g. "machine-learning/linear-models" ('' for the root). */
	path: string;
	label: string;
	description?: string;
	order?: number;
	topics: Topic[];
	posts: Post[];
};

/** "linear-models" → "Linear Models", for folders without a _meta.json. */
const titleCase = (slug: string) => slug.replace(/[-_]+/g, ' ').replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());

/** Topics: by `order`, then name. Posts: by `order`, then oldest first (series read in order). */
function sortTopic(topic: Topic) {
	topic.topics.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.label.localeCompare(b.label));
	topic.posts.sort((a, b) => a.data.order - b.data.order || a.data.date.getTime() - b.data.date.getTime());
	topic.topics.forEach(sortTopic);
}

/** The topic path a post sits in ('' = top level). */
export const topicOf = (post: Post) => (post.id.includes('/') ? post.id.slice(0, post.id.lastIndexOf('/')) : '');

export async function blogTree(): Promise<Topic> {
	const [all, metas] = await Promise.all([posts(), getCollection('blogTopics')]);
	const metaByPath = new Map(metas.map((m) => [m.id.replace(/\/?_meta$/, ''), m.data]));
	const root: Topic = { path: '', label: 'Blog', topics: [], posts: [] };
	const byPath = new Map<string, Topic>([['', root]]);

	function topicAt(path: string): Topic {
		const existing = byPath.get(path);
		if (existing) return existing;
		const parentPath = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
		const meta = metaByPath.get(path);
		const topic: Topic = {
			path,
			label: meta?.label ?? titleCase(path.split('/').at(-1)!),
			description: meta?.description,
			order: meta?.order,
			topics: [],
			posts: []
		};
		byPath.set(path, topic);
		topicAt(parentPath).topics.push(topic);
		return topic;
	}

	for (const post of all) topicAt(topicOf(post)).posts.push(post);
	sortTopic(root);
	return root;
}

/** Every topic below `topic` (not including it), depth first. */
export const allTopics = (topic: Topic): Topic[] => topic.topics.flatMap((t) => [t, ...allTopics(t)]);

/** All posts in reading order: a topic's own posts, then its subtopics'. */
export const readingOrder = (topic: Topic): Post[] => [...topic.posts, ...topic.topics.flatMap(readingOrder)];

/** Number of posts in a topic and everything below it. */
export const postCount = (topic: Topic): number => readingOrder(topic).length;

/** The topics from the root down to `path` (excluding the root), for breadcrumbs. */
export function trail(root: Topic, path: string): Topic[] {
	const out: Topic[] = [];
	let node: Topic | undefined = root;
	for (const segment of path ? path.split('/') : []) {
		const childPath: string = node ? (node.path ? `${node.path}/${segment}` : segment) : '';
		node = node?.topics.find((t) => t.path === childPath);
		if (node) out.push(node);
	}
	return out;
}

