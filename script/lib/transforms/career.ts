import type { Kind } from './kind.ts';
import { day, names, one, organization, positive, slugify, str, strings } from './util.ts';

const ORG_EXPAND = ['organization', 'organization.logo', 'skills'];

const listing = (r: Record<string, unknown>) => ({
	featured: r.is_featured === true,
	order: positive(r.sort_order) ?? 0
});

const period = (r: Record<string, unknown>) => ({
	start: day(r.start_date),
	end: r.is_current === true ? undefined : day(r.end_date),
	current: r.is_current === true
});

/** "acme-ai-engineer" from the organization and title. */
const nameOf = (...parts: unknown[]) => slugify(parts.map((p) => str(p) ?? '').join(' '));

export const experience: Kind = {
	collection: 'experience',
	expand: ORG_EXPAND,
	folder: 'data/experience',
	format: 'json',
	name: (r) => nameOf(one(r, 'organization')?.name ?? r.organization_name, r.job_title) || r.id,
	build: (r, ctx, file) => ({
		data: {
			title: str(r.job_title),
			organization: organization(r, 'organization', 'organization_name', ctx, file),
			employmentType: str(r.employment_type),
			arrangement: str(r.work_arrangement),
			location: str(r.location),
			...period(r),
			description: ctx.html(r.description),
			highlights: strings(r.highlights),
			skills: names(r, 'skills'),
			url: str(r.reference_url),
			...listing(r)
		}
	})
};

export const education: Kind = {
	collection: 'education',
	expand: ORG_EXPAND,
	folder: 'data/education',
	format: 'json',
	name: (r) => nameOf(one(r, 'organization')?.name ?? r.organization_name, r.degree) || r.id,
	build: (r, ctx, file) => ({
		data: {
			degree: str(r.degree),
			field: str(r.field_of_study),
			level: str(r.level),
			grade: str(r.grade),
			organization: organization(r, 'organization', 'organization_name', ctx, file),
			location: str(r.location),
			...period(r),
			description: ctx.html(r.description),
			activities: strings(r.activities),
			skills: names(r, 'skills'),
			...listing(r)
		}
	})
};

export const achievements: Kind = {
	collection: 'achievements',
	expand: ['issuer', 'issuer.logo', 'image', 'skills'],
	folder: 'data/achievements',
	format: 'json',
	name: (r) => str(r.slug) ?? (nameOf(r.title) || r.id),
	build: (r, ctx, file) => ({
		data: {
			title: str(r.title),
			kind: str(r.kind),
			issuer: organization(r, 'issuer', 'issuer_name', ctx, file),
			issued: day(r.issue_date),
			expires: r.does_not_expire === true ? undefined : day(r.expiry_date),
			credentialId: str(r.credential_id),
			url: str(r.credential_url) ?? str(r.url),
			description: ctx.html(r.description),
			image: ctx.media.image(one(r, 'image'), file),
			skills: names(r, 'skills'),
			...listing(r)
		}
	})
};
