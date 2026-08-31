import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { highlight, withLineNumbers } from "@blog/hl";
import { texToMathML } from "@blog/math";
import { render } from "@blog/md";
import { ensureEmbeds } from "./embeds.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { collectEmbedUrls, type EmbedMap, expandShortcodes } from "./shortcodes.ts";
import type { Post } from "./types.ts";

function parsePost(path: string, source: string, embeds: EmbedMap): Post {
  const { frontmatter, body } = parseFrontmatter(source);
  const html = render(expandShortcodes(body, embeds), {
    math: texToMathML,
    highlight: (code, lang) => withLineNumbers(highlight(code, lang)),
  });
  return {
    slug: basename(path, ".md"),
    title: frontmatter.title,
    date: frontmatter.date,
    tags: frontmatter.tags,
    rssDescription: frontmatter.rss_description,
    ...(frontmatter.cover !== undefined && { cover: frontmatter.cover }),
    html,
  };
}

export function loadPost(path: string, embeds: EmbedMap): Post {
  return parsePost(path, readFileSync(path, "utf8"), embeds);
}

export async function loadPosts(postsDir: string, embedsFile: string): Promise<Post[]> {
  const paths = readdirSync(postsDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(postsDir, f));
  // Read each post once and reuse it for both the embed-URL scan and parsing.
  const sources = paths.map((p) => readFileSync(p, "utf8"));
  const urls = sources.flatMap((s) => collectEmbedUrls(s));
  const embeds = await ensureEmbeds(urls, embedsFile);
  return paths.map((p, i) => parsePost(p, sources[i]!, embeds));
}
