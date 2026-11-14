/** The site's main sections, shared by the header and footer. */
export function navLinks(resume?: string) {
	return [
		{ href: '/projects/', label: 'Projects' },
		{ href: '/blog/', label: 'Blogs' },
		// { href: '/about/', label: 'About' },
		// ...(resume ? [{ href: resume, label: 'Résumé' }] : [])
	];
}

/** Whether a nav link is the current section (external files like the résumé never are). */
export const isCurrent = (href: string, path: string) => href.endsWith('/') && path.startsWith(href);
