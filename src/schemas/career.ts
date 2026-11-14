import { z } from 'astro/zod';
import { date, html, listing, organization, period, type ImageFn } from './common';

/** `data/experience/*.json` */
export const experienceSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		title: z.string(),
		organization: organization(image),
		employmentType: z.string().optional(),
		arrangement: z.string().optional(),
		location: z.string().optional(),
		...period,
		description: html,
		highlights: z.array(z.string()).default([]),
		skills: z.array(z.string()).default([]),
		url: z.url().optional(),
		...listing
	});

/** `data/education/*.json` */
export const educationSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		degree: z.string().optional(),
		field: z.string().optional(),
		level: z.string().optional(),
		grade: z.string().optional(),
		organization: organization(image),
		location: z.string().optional(),
		...period,
		description: html,
		activities: z.array(z.string()).default([]),
		skills: z.array(z.string()).default([]),
		...listing
	});

/** `data/achievements/*.json`: certifications, awards, publications, … */
export const achievementSchema = ({ image }: { image: ImageFn }) =>
	z.object({
		title: z.string(),
		kind: z.string().default('other'),
		issuer: organization(image).optional(),
		issued: date.optional(),
		expires: date.optional(),
		credentialId: z.string().optional(),
		url: z.url().optional(),
		description: html,
		image: image().optional(),
		skills: z.array(z.string()).default([]),
		...listing
	});
