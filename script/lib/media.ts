import { extname, posix } from 'node:path';
import type { Api, PbRecord } from './api.ts';
import type { Desired } from './sync.ts';

/** Image types Astro can optimize (or pass through, for SVG) when referenced from data files. */
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.svg', '.tiff']);

/**
 * Collects the media that synced files reference and turns each into a file to download:
 * - `images/<id>.<ext>`: referenced from JSON/frontmatter by relative path, so Astro optimizes it;
 * - `public/media/<id>.<ext>`: referenced by URL (rich-text HTML, the résumé), served as is.
 * A media file is re-downloaded only when its stored file name changes (PocketBase gives every
 * replaced file a new name).
 */
export function createMedia(api: Api) {
	const files = new Map<string, Desired>();

	function want(folder: 'images' | 'public/media', id: string, filename: string) {
		const path = `${folder}/${id}${extname(filename).toLowerCase()}`;
		if (!files.has(path)) {
			files.set(path, {
				path,
				version: filename,
				load: () => api.download(api.fileUrl(id, filename))
			});
		}
		return path;
	}

	return {
		/** Relative path from `fromFile` to the local copy of an image media record. */
		image(record: PbRecord | undefined, fromFile: string): string | undefined {
			const filename = typeof record?.file === 'string' ? record.file : '';
			if (!record || !IMAGE_EXT.has(extname(filename).toLowerCase())) return undefined;
			const path = want('images', record.id, filename);
			const relative = posix.relative(posix.dirname(fromFile), path);
			return relative.startsWith('.') ? relative : `./${relative}`;
		},

		/** Site URL of the public copy of any media file. */
		url(id: string, filename: string): string {
			return '/' + want('public/media', id, filename).slice('public/'.length);
		},

		desired: (): Desired[] => [...files.values()]
	};
}

export type Media = ReturnType<typeof createMedia>;
