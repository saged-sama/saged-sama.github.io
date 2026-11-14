import type { CollectionEntry } from 'astro:content';
import { formatDate, formatPeriod } from './dates';

/**
 * One row of a timeline. Experience, education, achievements and life events all map to this,
 * so a single Timeline component shows them all.
 */
export type TimelineEntry = {
	id: string;
	title: string;
	/** Organization, issuer, … */
	subtitle?: string;
	subtitleUrl?: string;
	period: string;
	/** For <time datetime>. */
	date?: Date;
	location?: string;
	logo?: ImageMetadata;
	/** Iconify id shown when there's no logo. */
	icon?: string;
	html: string;
	summary?: string;
	highlights: string[];
	tags: string[];
	url?: string;
};

const join = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' · ');
const label = (text?: string) => text?.replace(/[_-]/g, ' ');

export function fromExperience({ id, data }: CollectionEntry<'experience'>): TimelineEntry {
	return {
		id,
		title: data.title,
		subtitle: join(data.organization.name, label(data.employmentType)),
		subtitleUrl: data.organization.url,
		period: formatPeriod(data),
		date: data.start,
		location: join(data.location, label(data.arrangement)),
		logo: data.organization.logo,
		icon: 'lucide:briefcase',
		html: data.description,
		highlights: data.highlights,
		tags: data.skills,
		url: data.url
	};
}

export function fromEducation({ id, data }: CollectionEntry<'education'>): TimelineEntry {
	return {
		id,
		title: join(data.degree, data.field) || data.organization.name,
		subtitle: join(data.organization.name, data.grade && `Grade ${data.grade}`),
		subtitleUrl: data.organization.url,
		period: formatPeriod(data),
		date: data.start,
		location: data.location,
		logo: data.organization.logo,
		icon: 'lucide:graduation-cap',
		html: data.description,
		highlights: data.activities,
		tags: data.skills
	};
}

export function fromAchievement({ id, data }: CollectionEntry<'achievements'>): TimelineEntry {
	return {
		id,
		title: data.title,
		subtitle: join(data.issuer?.name, label(data.kind)),
		subtitleUrl: data.issuer?.url,
		period: formatDate(data.issued, 'month'),
		date: data.issued,
		logo: data.image ?? data.issuer?.logo,
		icon: 'lucide:award',
		html: data.description,
		highlights: data.credentialId ? [`Credential ID: ${data.credentialId}`] : [],
		tags: data.skills,
		url: data.url
	};
}

export function fromLifeEvent({ id, data }: CollectionEntry<'lifeEvents'>): TimelineEntry {
	const start = formatDate(data.date, data.precision);
	const end = formatDate(data.end, data.precision);
	return {
		id,
		title: data.title,
		subtitle: label(data.kind),
		period: end && end !== start ? `${start} – ${end}` : start,
		date: data.date,
		location: data.location,
		logo: data.cover,
		icon: data.icon ?? 'lucide:milestone',
		html: data.description,
		summary: data.summary,
		highlights: [],
		tags: data.tags
	};
}
