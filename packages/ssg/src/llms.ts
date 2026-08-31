/**
 * LLM-facing markdown mirrors, following the llms.txt convention
 * (https://llmstxt.org): every post is also served as markdown at
 * /posts/<slug>/index.md, /llms.txt indexes them, and /llms-full.txt
 * concatenates them. The WebMCP get_post tool reads the per-post mirror.
 */

import type { Post, SiteConfig } from "./types.ts";
import { byDateDesc, postPath } from "./urls.ts";

export function postMarkdown(site: SiteConfig, post: Post): string {
  return (
    `# ${post.title}\n\n` +
    `- date: ${post.date}\n` +
    `- tags: ${post.tags.join(", ")}\n` +
    `- url: ${site.siteUrl}${postPath(post.slug)}\n\n` +
    `${post.markdown}\n`
  );
}

export function llmsTxt(site: SiteConfig, posts: Post[]): string {
  const lines = byDateDesc(posts).map(
    (p) => `- [${p.title}](${site.siteUrl}${postPath(p.slug)}index.md): ${p.rssDescription}`,
  );
  return `# ${site.title}\n\n> ${site.description}\n\n## Posts\n\n${lines.join("\n")}\n`;
}

export function llmsFullTxt(site: SiteConfig, posts: Post[]): string {
  return byDateDesc(posts)
    .map((p) => postMarkdown(site, p))
    .join("\n---\n\n");
}
