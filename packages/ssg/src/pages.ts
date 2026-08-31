import { renderFeed } from "./rss.ts";
import { indexPage, notFoundPage, postPage, tagPage, tagsIndexPage } from "./templates.ts";
import type { Post, SiteConfig } from "./types.ts";
import { pageFile, postPath, tagPath, tagsIndexPath } from "./urls.ts";

/** Every generated page keyed by output file name (relative to dist). */
export function buildPages(site: SiteConfig, posts: Post[]): Map<string, string> {
  const pages = new Map<string, string>();
  pages.set("index.html", indexPage(site, posts));
  pages.set("404.html", notFoundPage(site));
  pages.set("feed.xml", renderFeed(site, posts));
  pages.set(pageFile(tagsIndexPath(site)), tagsIndexPage(site, posts));
  for (const post of posts) {
    pages.set(pageFile(postPath(post.slug)), postPage(site, post));
  }
  const tags = new Set(posts.flatMap((p) => p.tags));
  for (const tag of tags) {
    const tagged = posts.filter((p) => p.tags.includes(tag));
    pages.set(pageFile(tagPath(site, tag)), tagPage(site, tag, tagged));
  }
  return pages;
}
