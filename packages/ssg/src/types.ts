import type { OriginTrial } from "./origin-trials.ts";

export type SiteConfig = {
  siteUrl: string;
  title: string;
  description: string;
  author: string;
  authorUrl: string;
  postsDir: string;
  embedsFile: string;
  tagPath: string;
  originTrials?: OriginTrial[];
};

export type Post = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  rssDescription: string;
  cover?: string;
  html: string;
  markdown: string;
};
