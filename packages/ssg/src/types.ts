import type { OriginTrial } from "./origin-trials.ts";

/** A kind of post, and the sentence the types landing page explains it with. */
export type PostType = { name: string; description: string };

export type SiteConfig = {
  siteUrl: string;
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  postsDir: string;
  embedsFile: string;
  tagPath: string;
  typePath: string;
  postTypes: PostType[];
  originTrials?: OriginTrial[];
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  type: string;
  tags: string[];
  rssDescription: string;
  cover?: string;
  aliases?: string[];
  script?: string;
  style?: string;
  html: string;
  markdown: string;
};
