import { z } from 'astro/zod';
import { date, html, listing, type ImageFn } from './common';

/** `data/skills/*.json` */
export const skillSchema = z.object({
	name: z.string(),
	category: z.string().default('Other'),
	level: z.string().optional(),
	/** 0–100. */
	proficiency: z.number().optional(),
	years: z.number().optional(),
	url: z.url().optional(),
	icon: z.string().optional(),
	...listing
});

/** `data/testimonials/*.json` */
export const testimonialSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		author: z.string(),
		authorTitle: z.string().optional(),
		company: z.string().optional(),
		avatar: image().optional(),
		quote: z.string(),
		rating: z.number().optional(),
		url: z.url().optional(),
		date: date.optional(),
		...listing
	});

/** `data/life-events/*.json`: milestones on the timeline. */
export const lifeEventSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		title: z.string(),
		kind: z.string().default('milestone'),
		date,
		end: date.optional(),
		/** How precisely to show the date. */
		precision: z.enum(['day', 'month', 'year']).default('day'),
		location: z.string().optional(),
		summary: z.string().optional(),
		description: html,
		cover: image().optional(),
		icon: z.string().optional(),
		tags: z.array(z.string()).default([]),
		...listing
	});
