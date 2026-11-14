/**
 * Visit tracking: events go to portfolio-admin's telemetry endpoint for this portfolio, the same
 * one its hosted site uses, so the admin's analytics add both up. Override the address with
 * PUBLIC_TELEMETRY_URL at build time; set it to "off" to disable tracking.
 */
const DEFAULT_ENDPOINT = 'https://portfolio-admin.mahmudulhasanshajid.workers.dev/@saged/t';

export const telemetryEndpoint = (): string | null => {
	const configured = import.meta.env.PUBLIC_TELEMETRY_URL as string | undefined;
	if (configured === 'off') return null;
	// Only the deployed site counts; local dev and previews would skew the numbers.
	return import.meta.env.PROD ? (configured ?? DEFAULT_ENDPOINT) : null;
};

/** What a page is about, in the admin's terms: an item ("posts" + its id) or a plain page. */
export type TrackTarget = { collection: 'profiles' | 'posts' | 'projects' | 'page'; id?: string };

/** A target for an item synced from the admin; hand-written items (no id) count as pages. */
export const trackItem = (collection: TrackTarget['collection'], adminId?: string): TrackTarget =>
	adminId ? { collection, id: adminId } : { collection: 'page' };
