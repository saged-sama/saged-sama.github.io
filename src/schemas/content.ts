import { z } from 'astro/zod';
import { date, link, listing, organization, period, seo, type ImageFn } from './common';

/** Fields shared by Markdown entries that get their own page (blog posts and projects). */
const article = (image: ImageFn) => ({
	/** The item's id in portfolio-admin (set by the sync), for visit tracking. */
	adminId: z.string().optional(),
	title: z.string(),
	summary: z.string().optional(),
	cover: image().optional(),
	coverAlt: z.string().optional(),
	tags: z.array(z.string()).default([]),
	/** Minutes; computed from the text when missing. */
	readingTime: z.number().optional(),
	/** Drafts are left out of the build. */
	draft: z.boolean().default(false),
	seo: seo(image),
	...listing
});

/** `blogs/*.md`: the slug is the file name. */
export const blogSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		...article(image),
		date,
		updated: date.optional(),
		/** Where the post first appeared, if it was published elsewhere. */
		canonical: z.url().optional()
	});

/** `data/projects/*.md`: the slug is the file name, the body is the write-up. */
export const projectSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		...article(image),
		date: date.optional(),
		...period,
		gallery: z.array(image()).default([]),
		liveUrl: z.url().optional(),
		repoUrl: z.url().optional(),
		links: z.array(link).default([]),
		categories: z.array(z.string()).default([]),
		skills: z.array(z.string()).default([]),
		client: organization(image).optional(),
		role: z.string().optional(),
		teamSize: z.number().optional()
	});

/** `blogs/<topic>/_meta.json`: how a topic folder is shown. Without it, the folder name is used. */
export const blogTopicSchema = z.object({
	label: z.string(),
	description: z.string().optional(),
	/** Lower comes first; topics without one follow, by name. */
	order: z.number().optional()
});
