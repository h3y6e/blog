import type { OriginTrial } from "./origin-trials.ts";

export type SiteConfig = {
  /** e.g. "https://blog.h3y6e.com" (no trailing slash) */
  siteUrl: string;
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  /** posts directory relative to the site root, e.g. "posts" */
  postsDir: string;
  /** embed metadata JSON relative to the site root, e.g. "embeds.json" */
  embedsFile: string;
  /** tag page path segment, e.g. "tags" */
  tagPath: string;
  /** Chrome origin trial tokens, injected as <meta http-equiv="origin-trial"> on every page */
  originTrials?: OriginTrial[];
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  rssDescription: string;
  cover?: string;
  /** rendered HTML body */
  html: string;
  /** markdown body as authored (frontmatter stripped), for the LLM mirrors */
  markdown: string;
};
