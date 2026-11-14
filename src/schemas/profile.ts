import { z } from 'astro/zod';
import { html, listing, seo, type ImageFn } from './common';

/** `data/profile.json`: who the site is about. */
export const profileSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		name: z.string(),
		headline: z.string().optional(),
		pronouns: z.string().optional(),
		shortBio: z.string().optional(),
		bio: html,
		avatar: image().optional(),
		avatarAlt: z.string().optional(),
		location: z.string().optional(),
		email: z.email().optional(),
		phone: z.string().optional(),
		website: z.url().optional(),
		/** A file in public/ (e.g. "/resume.pdf") or an external URL. */
		resume: z.string().optional(),
		openToWork: z.boolean().default(false),
		availability: z.string().optional(),
		hobbies: z.array(z.string()).default([]),
		languages: z.array(z.object({ name: z.string(), level: z.string().optional() })).default([]),
		seo: seo(image)
	});

/** `data/social/*.json`: one link per file. */
export const socialSchema = z.object({
	platform: z.string(),
	label: z.string().optional(),
	url: z.string(),
	username: z.string().optional(),
	/** Iconify id such as "simple-icons:github"; falls back to a per-platform default. */
	icon: z.string().optional(),
	primary: z.boolean().default(false),
	...listing
});
