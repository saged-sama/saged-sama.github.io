import { z } from 'astro/zod';
import type { SchemaContext } from 'astro:content';

/** The `image()` helper Astro passes to collection schemas (validates and imports local images). */
export type ImageFn = SchemaContext['image'];

/** Dates are stored as ISO strings in JSON/frontmatter. */
export const date = z.coerce.date();

/** Ordering and highlighting, shared by every list item. Lower `order` comes first. */
export const listing = {
	featured: z.boolean().default(false),
	order: z.number().default(0)
};

/** A start/end range; `current` means it's still ongoing (no end date). */
export const period = {
	start: date.optional(),
	end: date.optional(),
	current: z.boolean().default(false)
};

/** Rich text from the admin (already sanitized HTML) or written by hand. */
export const html = z.string().default('');

export const link = z.object({ label: z.string(), url: z.url() });

/** A company, school or issuer, flattened into the item that references it. */
export const organization = (image: ImageFn) =>
	z.object({
		name: z.string(),
		url: z.url().optional(),
		logo: image().optional(),
		location: z.string().optional()
	});

/** SEO overrides; pages fall back to the title and summary. */
export const seo = (image: ImageFn) =>
	z
		.object({
			title: z.string().optional(),
			description: z.string().optional(),
			image: image().optional()
		})
		.default({});
