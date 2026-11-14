import type { PbRecord } from '../api.ts';
import type { Ctx } from './util.ts';

/** How one admin collection becomes local files. */
export type Kind = {
	collection: string;
	/** Relations to expand when fetching. */
	expand: string[];
	/** Folder the files go in, relative to the repo root. */
	folder: string;
	format: 'json' | 'md';
	/** File name without extension (may include sub-folders); duplicates get the record id appended. */
	name: (record: PbRecord) => string;
	/** Front matter / JSON data, plus the body for Markdown. `file` is the target path. */
	build: (record: PbRecord, ctx: Ctx, file: string) => { data: object; body?: string };
	/** Only the first record is kept (the profile). */
	single?: boolean;
	/** Extra JSON files derived from all records (e.g. blog topic names): path → data. */
	extras?: (records: PbRecord[]) => Map<string, object>;
};
