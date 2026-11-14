/** Date formatting. Dates are shown in UTC so a date-only value never shifts a day. */

type Precision = 'day' | 'month' | 'year';

const FORMATS: Record<Precision, Intl.DateTimeFormatOptions> = {
	day: { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' },
	month: { month: 'short', year: 'numeric', timeZone: 'UTC' },
	year: { year: 'numeric', timeZone: 'UTC' }
};

export function formatDate(date: Date | undefined, precision: Precision = 'day'): string {
	return date ? date.toLocaleDateString('en-US', FORMATS[precision]) : '';
}

/** "Aug 2025 – Oct 2025", "May 2026 – Present". */
export function formatPeriod(item: { start?: Date; end?: Date; current?: boolean }): string {
	const start = formatDate(item.start, 'month');
	const end = item.current ? 'Present' : formatDate(item.end, 'month');
	if (start && end && start !== end) return `${start} – ${end}`;
	return start || end;
}

/** For `<time datetime>`. */
export const isoDay = (date: Date | undefined) => date?.toISOString().slice(0, 10) ?? '';
