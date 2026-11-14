import { getIconData, iconToHTML, iconToSVG, replaceIDs } from '@iconify/utils';
import type { IconifyJSON } from '@iconify/types';
import lucide from '@iconify-json/lucide/icons.json';
import simpleIcons from '@iconify-json/simple-icons/icons.json';
import tabler from '@iconify-json/tabler/icons.json';

/**
 * Icons by Iconify id ("simple-icons:github", "lucide:mail", "tabler:code"), the same ids the
 * admin stores. Rendered to inline SVG at build time; the sets are never shipped to the browser.
 */
const SETS: Record<string, IconifyJSON> = {
	'simple-icons': simpleIcons as IconifyJSON,
	lucide: lucide as IconifyJSON,
	tabler: tabler as IconifyJSON
};

/** Default icon per social platform, used when a link has none of its own. */
export const PLATFORM_ICONS: Record<string, string> = {
	github: 'simple-icons:github',
	gitlab: 'simple-icons:gitlab',
	linkedin: 'simple-icons:linkedin',
	x: 'simple-icons:x',
	mastodon: 'simple-icons:mastodon',
	bluesky: 'simple-icons:bluesky',
	instagram: 'simple-icons:instagram',
	facebook: 'simple-icons:facebook',
	youtube: 'simple-icons:youtube',
	twitch: 'simple-icons:twitch',
	dribbble: 'simple-icons:dribbble',
	behance: 'simple-icons:behance',
	medium: 'simple-icons:medium',
	devto: 'simple-icons:devdotto',
	hashnode: 'simple-icons:hashnode',
	stackoverflow: 'simple-icons:stackoverflow',
	kaggle: 'simple-icons:kaggle',
	leetcode: 'simple-icons:leetcode',
	codepen: 'simple-icons:codepen',
	telegram: 'simple-icons:telegram',
	whatsapp: 'simple-icons:whatsapp',
	discord: 'simple-icons:discord',
	email: 'lucide:mail',
	rss: 'lucide:rss',
	website: 'lucide:globe',
	other: 'lucide:link'
};

/** Inline SVG markup for an icon id, or '' if the set or icon doesn't exist. */
export function iconSvg(id: string | undefined, attributes: Record<string, string> = {}): string {
	const [prefix, name] = (id ?? '').split(':');
	const set = SETS[prefix];
	const data = set && name ? getIconData(set, name) : null;
	if (!data) return '';
	const { attributes: svgAttributes, body } = iconToSVG(data, { height: '1em' });
	return iconToHTML(replaceIDs(body), { ...svgAttributes, 'aria-hidden': 'true', ...attributes });
}
