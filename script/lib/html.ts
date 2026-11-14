import type { Media } from './media.ts';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Points media inside rich-text HTML at local copies. The admin writes them as
 * `<pb>/api/files/media/<id>/<file>` (optionally with `?thumb=…`).
 */
export function localizeMedia(html: string, media: Media, prefix: string): string {
	const pattern = new RegExp(`${escapeRegExp(prefix)}([a-z0-9]+)/([^"'?\\s)]+)(\\?[^"'\\s)]*)?`, 'g');
	return html.replace(pattern, (_, id: string, file: string) => media.url(id, decodeURIComponent(file)));
}

/**
 * Puts HTML on one line so Markdown keeps it as a single raw HTML block: a blank line inside
 * (e.g. in a code block) would otherwise end the block and the rest would be parsed as Markdown.
 * Newlines inside <pre> become `&#10;`, which renders the same.
 */
export function toSingleLine(html: string): string {
	return html
		.split(/(<pre[\s\S]*?<\/pre>)/)
		.map((part, i) => (i % 2 ? part.replace(/\r?\n/g, '&#10;') : part.replace(/\s*\r?\n\s*/g, ' ')))
		.join('')
		.trim();
}
