import type { Local } from './local.ts';

/**
 * Replaces the inside of each `<!-- portfolio:NAME -->…<!-- /portfolio:NAME -->` block. Text
 * outside the markers, and blocks without a generator, stay as written.
 */
export function replaceSections(readme: string, sections: Record<string, string>) {
	const found: string[] = [];
	const text = readme.replace(
		/(<!-- portfolio:([a-z-]+) -->)[\s\S]*?(<!-- \/portfolio:\2 -->)/g,
		(block, open: string, name: string, close: string) => {
			if (!(name in sections)) return block;
			found.push(name);
			return `${open}\n${sections[name].trim()}\n${close}`;
		}
	);
	return { text, found };
}

const LIMIT = 5;

const date = (value: unknown) =>
	value ? new Date(String(value)).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

/** The generated README blocks, linking back to the site. */
export function readmeSections(local: Local, siteUrl: string): Record<string, string> {
	const posts = local.posts
		.slice(0, LIMIT)
		.map((p) => `- [${p.title}](${siteUrl}/blog/${p.slug}/)${p.date ? ` · ${date(p.date)}` : ''}`);
	const projects = local.projects
		.slice(0, LIMIT)
		.map((p) => `- [**${p.title}**](${siteUrl}/projects/${p.slug}/)${p.summary ? `: ${p.summary}` : ''}`);
	const skills = local.skills
		.filter((s) => s.featured === true)
		.sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0))
		.map((s) => `\`${s.name}\``);

	return {
		posts: posts.length ? `${posts.join('\n')}\n\n[All posts →](${siteUrl}/blog/)` : '_No posts yet._',
		projects: projects.length
			? `${projects.join('\n')}\n\n[All projects →](${siteUrl}/projects/)`
			: '_No projects yet._',
		skills: skills.join(' '),
		site: `[${siteUrl.replace(/^https?:\/\//, '')}](${siteUrl})`
	};
}
