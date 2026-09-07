import type { SiteConfig } from "./types.ts";

export function postPath(slug: string): string {
  return `/posts/${slug}/`;
}

export function postFullUrl(site: SiteConfig, slug: string): string {
  return `${site.siteUrl}${postPath(slug)}index.html`;
}

export function tagPath(site: SiteConfig, tag: string): string {
  return `/${site.tagPath}/${tag}/`;
}

export function tagFullUrl(site: SiteConfig, tag: string): string {
  return `${site.siteUrl}${tagPath(site, tag)}index.html`;
}

export function tagsIndexPath(site: SiteConfig): string {
  return `/${site.tagPath}/`;
}

export function tagsIndexFullUrl(site: SiteConfig): string {
  return `${site.siteUrl}${tagsIndexPath(site)}index.html`;
}

export function pageFile(urlPath: string): string {
  return `${urlPath.slice(1)}index.html`;
}

export function byDateDesc<T extends { date: string; slug: string }>(posts: T[]): T[] {
  return posts.toSorted((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function byDateDescFeed<T extends { date: string; slug: string }>(posts: T[]): T[] {
  return posts.toSorted((a, b) => b.date.localeCompare(a.date) || b.slug.localeCompare(a.slug));
}
