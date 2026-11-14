import type { Kind } from './kind.ts';
import { day, names, one, positive, slugify, str } from './util.ts';

export const skills: Kind = {
	collection: 'skills',
	expand: [],
	folder: 'data/skills',
	format: 'json',
	// The name, not the stored slug: slugs can lag behind renames.
	name: (r) => slugify(str(r.name) ?? '') || r.id,
	build: (r) => ({
		data: {
			name: str(r.name),
			category: str(r.category),
			level: str(r.level),
			proficiency: positive(r.proficiency),
			years: positive(r.years_of_experience),
			url: str(r.url),
			icon: str(r.icon_name),
			featured: r.is_featured === true,
			order: positive(r.sort_order) ?? 0
		}
	})
};

export const testimonials: Kind = {
	collection: 'testimonials',
	expand: ['author_company', 'author_avatar'],
	folder: 'data/testimonials',
	format: 'json',
	name: (r) => slugify(str(r.author_name) ?? '') || r.id,
	build: (r, ctx, file) => ({
		data: {
			author: str(r.author_name),
			authorTitle: str(r.author_title),
			company: str(one(r, 'author_company')?.name) ?? str(r.author_company_name),
			avatar: ctx.media.image(one(r, 'author_avatar'), file),
			quote: str(r.quote),
			rating: positive(r.rating),
			url: str(r.source_url),
			date: day(r.given_at),
			featured: r.is_featured === true,
			order: positive(r.sort_order) ?? 0
		}
	})
};

export const lifeEvents: Kind = {
	collection: 'life_events',
	expand: ['cover_image', 'tags'],
	folder: 'data/life-events',
	format: 'json',
	name: (r) => str(r.slug) ?? (slugify(str(r.title) ?? '') || r.id),
	build: (r, ctx, file) => ({
		data: {
			title: str(r.title),
			kind: str(r.kind),
			date: day(r.date),
			end: day(r.end_date),
			precision: str(r.date_precision),
			location: str(r.location),
			summary: str(r.summary),
			description: ctx.html(r.content_html),
			cover: ctx.media.image(one(r, 'cover_image'), file),
			icon: str(r.icon_name),
			tags: names(r, 'tags'),
			featured: r.is_featured === true,
			order: positive(r.sort_order) ?? 0
		}
	})
};
