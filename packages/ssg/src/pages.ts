import { llmsFullTxt, llmsTxt, postMarkdown } from "./llms.ts";
import { renderFeed } from "./rss.ts";
import { indexPage, notFoundPage, postPage, tagPage, tagsIndexPage } from "./templates.ts";
import type { Post, SiteConfig } from "./types.ts";
import { byDateDesc, pageFile, postPath, tagPath, tagsIndexPath } from "./urls.ts";

/** Post metadata index consumed by the WebMCP list_posts tool (webmcp.ts). */
function postsJson(site: SiteConfig, posts: Post[]): string {
  return JSON.stringify(
    byDateDesc(posts).map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      tags: p.tags,
      description: p.rssDescription,
      url: `${site.siteUrl}${postPath(p.slug)}`,
    })),
  );
}

/** Every generated page keyed by output file name (relative to dist). */
export function buildPages(site: SiteConfig, posts: Post[]): Map<string, string> {
  const pages = new Map<string, string>();
  pages.set("index.html", indexPage(site, posts));
  pages.set("404.html", notFoundPage(site));
  pages.set("feed.xml", renderFeed(site, posts));
  pages.set("posts.json", postsJson(site, posts));
  pages.set("llms.txt", llmsTxt(site, posts));
  pages.set("llms-full.txt", llmsFullTxt(site, posts));
  pages.set(pageFile(tagsIndexPath(site)), tagsIndexPage(site, posts));
  for (const post of posts) {
    pages.set(pageFile(postPath(post.slug)), postPage(site, post));
    // The markdown mirror answers at both guessable URLs:
    // /posts/<slug>/index.md (page URL + index.md) and /posts/<slug>.md.
    const markdown = postMarkdown(site, post);
    pages.set(`${postPath(post.slug).slice(1)}index.md`, markdown);
    pages.set(`posts/${post.slug}.md`, markdown);
  }
  const tags = new Set(posts.flatMap((p) => p.tags));
  for (const tag of tags) {
    const tagged = posts.filter((p) => p.tags.includes(tag));
    pages.set(pageFile(tagPath(site, tag)), tagPage(site, tag, tagged));
  }
  return pages;
}
