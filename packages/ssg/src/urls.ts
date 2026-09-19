import type { SiteConfig } from "./types.ts";

type PostRef = { date: string; slug: string };

export function postDir(post: PostRef): string {
  return `${post.date.replaceAll("-", "/")}/${post.slug}`;
}

export function postPath(post: PostRef): string {
  return `/posts/${postDir(post)}/`;
}

export function postScriptUrl(post: PostRef): string {
  return `${postPath(post)}index.js`;
}

export function postStyleUrl(post: PostRef): string {
  return `${postPath(post)}index.css`;
}

export function postFullUrl(site: SiteConfig, post: PostRef): string {
  return `${site.siteUrl}${postPath(post)}index.html`;
}

export function tagPath(site: SiteConfig, tag: string): string {
  return `/${site.tagPath}/${tag}/`;
}

export function tagsIndexPath(site: SiteConfig): string {
  return `/${site.tagPath}/`;
}

export function tagsIndexFullUrl(site: SiteConfig): string {
  return `${site.siteUrl}${tagsIndexPath(site)}index.html`;
}

export function typePath(site: SiteConfig, type: string): string {
  return `/${site.typePath}/${type.toLowerCase()}/`;
}

export function typesIndexPath(site: SiteConfig): string {
  return `/${site.typePath}/`;
}

export function typesIndexFullUrl(site: SiteConfig): string {
  return `${site.siteUrl}${typesIndexPath(site)}index.html`;
}

/** `/posts/`, `/posts/YYYY/`, `/posts/YYYY/MM/` and `/posts/YYYY/MM/DD/` for a date. */
export function archivePaths(date: string): string[] {
  const parts = date.split("-");
  return [0, 1, 2, 3].map((n) => ["/posts", ...parts.slice(0, n), ""].join("/"));
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
