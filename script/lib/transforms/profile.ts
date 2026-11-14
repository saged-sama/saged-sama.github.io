import type { Kind } from './kind.ts';
import { one, positive, slugify, str, strings } from './util.ts';

export const profile: Kind = {
	collection: 'profiles',
	expand: ['avatar', 'resume', 'og_image'],
	folder: 'data',
	format: 'json',
	single: true,
	name: () => 'profile',
	build(r, ctx, file) {
		const avatar = one(r, 'avatar');
		const resume = one(r, 'resume');
		const languages = Array.isArray(r.languages) ? (r.languages as { name?: string; level?: string }[]) : [];
		return {
			data: {
				name: str(r.display_name) ?? [str(r.given_name), str(r.surname)].filter(Boolean).join(' '),
				headline: str(r.headline),
				pronouns: str(r.pronouns),
				shortBio: str(r.short_bio),
				bio: ctx.html(r.bio),
				avatar: ctx.media.image(avatar, file),
				avatarAlt: str(avatar?.alt),
				location: str(r.location),
				email: str(r.public_email),
				phone: str(r.public_phone),
				website: str(r.website),
				// Prefer the uploaded file (served from this site) over an external link.
				resume: resume && str(resume.file) ? ctx.media.url(resume.id, String(resume.file)) : str(r.resume_url),
				openToWork: r.open_to_work === true,
				availability: str(r.availability_note),
				hobbies: strings(r.hobbies),
				languages: languages
					.filter((l) => str(l?.name))
					.map((l) => ({ name: str(l.name), level: str(l.level) })),
				seo: {
					title: str(r.seo_title),
					description: str(r.seo_description),
					image: ctx.media.image(one(r, 'og_image'), file)
				}
			}
		};
	}
};

export const social: Kind = {
	collection: 'social_links',
	expand: [],
	folder: 'data/social',
	format: 'json',
	name: (r) => slugify(str(r.label) ?? str(r.platform) ?? '') || r.id,
	build: (r) => ({
		data: {
			platform: str(r.platform) ?? 'website',
			label: str(r.label),
			url: str(r.url),
			username: str(r.username),
			icon: str(r.icon_name),
			primary: r.is_primary === true,
			featured: r.is_featured === true,
			order: positive(r.sort_order) ?? 0
		}
	})
};
