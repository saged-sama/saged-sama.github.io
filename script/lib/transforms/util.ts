import type { PbRecord } from '../api.ts';
import type { Media } from '../media.ts';
import { localizeMedia } from '../html.ts';

/** What every transform gets: the media collector and the rich-text fixer. */
export type Ctx = {
	media: Media;
	/** Rich-text HTML with media pointed at local copies. */
	html: (value: unknown) => string;
};

export function createCtx(media: Media, mediaUrlPrefix: string): Ctx {
	return { media, html: (value) => localizeMedia(str(value) ?? '', media, mediaUrlPrefix) };
}

export const str = (value: unknown): string | undefined =>
	typeof value === 'string' && value.trim() ? value.trim() : undefined;

/** Numbers the admin stores as 0 when unset. */
export const positive = (value: unknown): number | undefined =>
	typeof value === 'number' && value > 0 ? value : undefined;

export const strings = (value: unknown): string[] =>
	Array.isArray(value) ? value.map(str).filter((v): v is string => !!v) : [];

/** PocketBase dates ("2025-08-01 00:00:00.000Z") as ISO; midnight-UTC dates as plain days. */
export function day(value: unknown): string | undefined {
	const text = str(value);
	if (!text) return undefined;
	const iso = text.replace(' ', 'T');
	return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : iso;
}

export function one(record: PbRecord, field: string): PbRecord | undefined {
	const value = record.expand?.[field];
	return Array.isArray(value) ? value[0] : value;
}

export function many(record: PbRecord, field: string): PbRecord[] {
	const value = record.expand?.[field];
	return Array.isArray(value) ? value : value ? [value] : [];
}

/** Names of expanded relations (tags, skills, categories). */
export const names = (record: PbRecord, field: string) =>
	many(record, field)
		.map((r) => str(r.name))
		.filter((n): n is string => !!n);

/** An organization flattened into the item: the linked record if any, else the typed name. */
export function organization(record: PbRecord, field: string, nameField: string, ctx: Ctx, file: string) {
	const org = one(record, field);
	const name = str(org?.name) ?? str(record[nameField]);
	if (!name) return undefined;
	return {
		name,
		url: str(org?.website),
		logo: org ? ctx.media.image(one(org, 'logo'), file) : undefined,
		location: str(org?.location)
	};
}

export function slugify(text: string): string {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

/** Drops empty values (undefined, null, '', false, [], {}) so files only hold what's set. */
export function clean<T>(value: T): T {
	if (Array.isArray(value)) return value.map(clean).filter((v) => !isEmpty(v)) as T;
	if (value && typeof value === 'object') {
		const entries = Object.entries(value).map(([k, v]) => [k, clean(v)] as const);
		return Object.fromEntries(entries.filter(([, v]) => !isEmpty(v))) as T;
	}
	return value;
}

function isEmpty(value: unknown) {
	if (value === undefined || value === null || value === '' || value === false) return true;
	if (Array.isArray(value)) return value.length === 0;
	return typeof value === 'object' && Object.keys(value).length === 0;
}
