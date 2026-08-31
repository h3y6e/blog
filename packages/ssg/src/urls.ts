import type { SiteConfig } from "./types.ts";

export function postPath(slug: string): string {
  return `/posts/${slug}/`;
}

/** Canonical URL as published in RSS GUIDs and og:url — must keep index.html. */
export function postFullUrl(site: SiteConfig, slug: string): string {
  return `${site.siteUrl}${postPath(slug)}index.html`;
}

export function tagPath(site: SiteConfig, tag: string): string {
  return `/${site.tagPath}/${tag}/`;
}

/** Canonical URL for a tag page's og:url — mirrors postFullUrl. */
export function tagFullUrl(site: SiteConfig, tag: string): string {
  return `${site.siteUrl}${tagPath(site, tag)}index.html`;
}

export function tagsIndexPath(site: SiteConfig): string {
  return `/${site.tagPath}/`;
}

/** Canonical URL for the tags landing page's og:url. */
export function tagsIndexFullUrl(site: SiteConfig): string {
  return `${site.siteUrl}${tagsIndexPath(site)}index.html`;
}

/** dist output file path for a page URL, which always ends in "/" and is
 * served as that directory's index.html (every post/tag page follows this). */
export function pageFile(urlPath: string): string {
  return `${urlPath.slice(1)}index.html`;
}

/** Sort for the index and tag listings: newest first, ties by slug ascending. */
export function byDateDesc<T extends { date: string; slug: string }>(posts: T[]): T[] {
  return posts.toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

/** Sort for the RSS feed: newest first, ties by slug descending (Franklin's order). */
export function byDateDescFeed<T extends { date: string; slug: string }>(posts: T[]): T[] {
  return posts.toSorted((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}
