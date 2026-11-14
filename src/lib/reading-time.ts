const WORDS_PER_MINUTE = 220;

/** Minutes to read: the stored value, or estimated from the body (Markdown or HTML). */
export function readingTime(entry: { data: { readingTime?: number }; body?: string }): number {
	if (entry.data.readingTime) return entry.data.readingTime;
	const text = (entry.body ?? '').replace(/<[^>]+>/g, ' ').replace(/[#*_`>[\]()-]/g, ' ');
	const words = text.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
