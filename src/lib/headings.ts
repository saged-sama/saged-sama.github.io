import type { MarkdownHeading } from 'astro';

/**
 * Section headings for "On this page". Markdown posts get them from Astro; synced posts are raw
 * HTML (with heading ids from the admin), so they're read from the HTML.
 */
export function pageHeadings(fromMarkdown: MarkdownHeading[], body = ''): MarkdownHeading[] {
	if (fromMarkdown.length) return fromMarkdown.filter((h) => h.depth === 2 || h.depth === 3);
	const found: MarkdownHeading[] = [];
	for (const match of body.matchAll(/<h([23])[^>]*\sid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)) {
		const text = match[3].replace(/<[^>]+>/g, '').trim();
		if (text) found.push({ depth: Number(match[1]), slug: match[2], text });
	}
	return found;
}
