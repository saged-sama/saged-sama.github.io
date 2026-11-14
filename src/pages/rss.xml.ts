import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { posts, profile } from '@/lib/content';

export async function GET(context: APIContext) {
	const [me, all] = await Promise.all([profile(), posts()]);
	return rss({
		title: `${me.name} · Blog`,
		description: me.shortBio ?? `Posts by ${me.name}`,
		site: context.site!,
		items: all.map((post) => ({
			title: post.data.title,
			description: post.data.summary,
			pubDate: post.data.date,
			categories: post.data.tags,
			link: `/blog/${post.id}/`
		}))
	});
}
