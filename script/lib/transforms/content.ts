import type { PbRecord } from '../api.ts';
import { toSingleLine } from '../html.ts';
import { topicFolder, topicMetas } from '../topics.ts';
import type { Kind } from './kind.ts';
import { day, many, names, one, organization, positive, str, type Ctx } from './util.ts';

/** Front matter shared by posts and projects. */
function article(r: PbRecord, ctx: Ctx, file: string) {
	const cover = one(r, 'cover_image');
	return {
		// The admin's record id, so visits to the page count toward this item in the admin.
		adminId: r.id,
		title: str(r.title),
		summary: str(r.summary),
		cover: ctx.media.image(cover, file),
		coverAlt: str(cover?.alt),
		tags: names(r, 'tags'),
		readingTime: positive(r.reading_time),
		seo: {
			title: str(r.seo_title),
			description: str(r.seo_description),
			image: ctx.media.image(one(r, 'og_image'), file)
		},
		featured: r.is_featured === true,
		order: positive(r.sort_order) ?? 0
	};
}

/** The admin's rendered HTML as the Markdown body, kept as one raw HTML block. */
const body = (r: PbRecord, ctx: Ctx) => toSingleLine(ctx.html(r.content_html));

export const posts: Kind = {
	collection: 'posts',
	expand: ['cover_image', 'tags', 'og_image'],
	folder: 'blogs',
	format: 'md',
	// The topic path is the folder: blogs/machine-learning/linear-models/<slug>.md
	name: (r) => [topicFolder(r), str(r.slug) ?? r.id].filter(Boolean).join('/'),
	extras: (records) => topicMetas(records, 'blogs'),
	build: (r, ctx, file) => ({
		data: {
			...article(r, ctx, file),
			date: day(r.published_at),
			canonical: str(r.canonical_url)
		},
		body: body(r, ctx)
	})
};

export const projects: Kind = {
	collection: 'projects',
	expand: ['cover_image', 'gallery', 'categories', 'tags', 'skills', 'client', 'client.logo', 'og_image'],
	folder: 'data/projects',
	format: 'md',
	name: (r) => str(r.slug) ?? r.id,
	build: (r, ctx, file) => ({
		data: {
			...article(r, ctx, file),
			date: day(r.published_at),
			start: day(r.start_date),
			end: r.is_ongoing === true ? undefined : day(r.end_date),
			current: r.is_ongoing === true,
			gallery: many(r, 'gallery').map((m) => ctx.media.image(m, file)),
			liveUrl: str(r.live_url),
			repoUrl: str(r.repo_url),
			links: Array.isArray(r.links) ? r.links : [],
			categories: names(r, 'categories'),
			skills: names(r, 'skills'),
			client: organization(r, 'client', 'client_name', ctx, file),
			role: str(r.role),
			teamSize: positive(r.team_size)
		},
		body: body(r, ctx)
	})
};
