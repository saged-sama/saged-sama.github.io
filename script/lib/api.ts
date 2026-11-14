import type { Env } from './env.ts';

/** A PocketBase record as the API returns it; `expand` holds the requested relations. */
export type PbRecord = {
	id: string;
	updated: string;
	expand?: Record<string, PbRecord | PbRecord[] | undefined>;
	[field: string]: unknown;
};

const PAGE_SIZE = 200;

/**
 * Read-only client for portfolio-admin's public API. The publishable key only ever returns the
 * owner's published and visible items, so whatever isn't returned is treated as gone.
 */
export function createApi(env: Pick<Env, 'pbUrl' | 'apiKey'>) {
	async function get(path: string): Promise<unknown> {
		for (let attempt = 1; ; attempt++) {
			const res = await fetch(`${env.pbUrl}${path}`, { headers: { 'X-Api-Key': env.apiKey } });
			// The shared host rate-limits bursts; wait a little and try again.
			if (res.status === 429 && attempt < 4) {
				await new Promise((r) => setTimeout(r, attempt * 2000));
				continue;
			}
			if (!res.ok) throw new Error(`GET ${path.split('?')[0]} failed: ${res.status} ${await res.text()}`);
			return res.json();
		}
	}

	return {
		/** Every record of a collection, following pagination. */
		async list(collection: string, expand: string[] = []): Promise<PbRecord[]> {
			const items: PbRecord[] = [];
			for (let page = 1; ; page++) {
				const query = new URLSearchParams({ page: String(page), perPage: String(PAGE_SIZE) });
				if (expand.length) query.set('expand', expand.join(','));
				const body = (await get(`/api/collections/${collection}/records?${query}`)) as {
					items: PbRecord[];
					totalPages: number;
				};
				items.push(...body.items);
				if (page >= body.totalPages) return items;
			}
		},

		/** Original file of a media record. */
		fileUrl(mediaId: string, filename: string) {
			return `${env.pbUrl}/api/files/media/${mediaId}/${encodeURIComponent(filename)}`;
		},

		/** Prefix of media URLs inside rich-text HTML. */
		mediaUrlPrefix: `${env.pbUrl}/api/files/media/`,

		async download(url: string): Promise<Buffer> {
			const res = await fetch(url);
			if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
			return Buffer.from(await res.arrayBuffer());
		}
	};
}

export type Api = ReturnType<typeof createApi>;
