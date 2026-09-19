import { llmsFullTxt, llmsTxt, postMarkdown } from "./llms.ts";
import { renderFeed } from "./rss.ts";
import {
  indexPage,
  notFoundPage,
  postPage,
  redirectPage,
  listPage,
  tagsIndexPage,
  typesIndexPage,
} from "./templates.ts";
import type { Post, SiteConfig } from "./types.ts";
import {
  archivePaths,
  byDateDesc,
  pageFile,
  postPath,
  tagPath,
  tagsIndexPath,
  typePath,
  typesIndexPath,
} from "./urls.ts";

function postsJson(site: SiteConfig, posts: Post[]): string {
  return JSON.stringify(
    byDateDesc(posts).map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      type: p.type,
      tags: p.tags,
      description: p.rssDescription,
      url: `${site.siteUrl}${postPath(p)}`,
    })),
  );
}

export function buildPages(site: SiteConfig, posts: Post[]): Map<string, string> {
  const pages = new Map<string, string>();
  pages.set("index.html", indexPage(site, posts));
  pages.set("404.html", notFoundPage(site));
  pages.set("feed.xml", renderFeed(site, posts));
  pages.set("posts.json", postsJson(site, posts));
  pages.set("llms.txt", llmsTxt(site, posts));
  pages.set("llms-full.txt", llmsFullTxt(site, posts));
  pages.set(pageFile(tagsIndexPath(site)), tagsIndexPage(site, posts));
  pages.set(pageFile(typesIndexPath(site)), typesIndexPage(site, posts));
  for (const post of posts) {
    pages.set(pageFile(postPath(post)), postPage(site, post));
    pages.set(`${postPath(post).slice(1)}index.md`, postMarkdown(site, post));
    for (const alias of post.aliases ?? []) {
      pages.set(pageFile(alias), redirectPage(site, post));
    }
  }
  const tags = new Set(posts.flatMap((p) => p.tags));
  for (const tag of tags) {
    const tagged = posts.filter((p) => p.tags.includes(tag));
    pages.set(
      pageFile(tagPath(site, tag)),
      listPage(site, `Tag: #${tag}`, tagPath(site, tag), tagged),
    );
  }
  for (const type of new Set(posts.map((p) => p.type))) {
    const typed = posts.filter((p) => p.type === type);
    pages.set(pageFile(typePath(site, type)), listPage(site, type, typePath(site, type), typed));
  }
  const archives = new Set(posts.flatMap((p) => archivePaths(p.date)));
  for (const path of archives) {
    const within = posts.filter((p) => postPath(p).startsWith(path));
    const title = path === "/posts/" ? "Posts" : path.slice("/posts/".length, -1);
    pages.set(pageFile(path), listPage(site, title, path, within));
  }
  return pages;
}
