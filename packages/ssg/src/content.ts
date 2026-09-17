import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { highlight, withLineNumbers } from "@blog/hl";
import { texToMathML } from "@blog/math";
import { render } from "@blog/md";
import { ensureEmbeds } from "./embeds.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { collectEmbedUrls, type EmbedMap, expandShortcodes } from "./shortcodes.ts";
import type { Post } from "./types.ts";
import { postDir, postPath } from "./urls.ts";

const RELATIVE_SRC = /\ssrc="(?![a-z]+:|\/|#)([^"]*)"/g;

function absolutizeMedia(html: string, dir: string, urlDir: string): string {
  return html.replace(RELATIVE_SRC, (_m, src: string) => {
    if (!existsSync(join(dir, src))) throw new Error(`${dir}: media not found: ${src}`);
    return ` src="${urlDir}${src}"`;
  });
}

function parsePost(postsDir: string, path: string, source: string, embeds: EmbedMap): Post {
  const dir = dirname(path);
  const { frontmatter, body } = parseFrontmatter(source);
  const ref = { date: frontmatter.date, slug: basename(dir) };
  const actual = relative(postsDir, dir).split(sep).join("/");
  if (actual !== postDir(ref)) {
    throw new Error(`${path}: date ${frontmatter.date} does not match directory ${actual}`);
  }
  if (frontmatter.cover !== undefined && !existsSync(join(dir, frontmatter.cover))) {
    throw new Error(`${path}: cover not found: ${frontmatter.cover}`);
  }
  const rendered = render(expandShortcodes(body, embeds), {
    math: texToMathML,
    highlight: (code, lang) => withLineNumbers(highlight(code, lang)),
  });
  return {
    ...ref,
    title: frontmatter.title,
    tags: frontmatter.tags,
    rssDescription: frontmatter.rss_description,
    ...(frontmatter.cover !== undefined && { cover: frontmatter.cover }),
    ...(frontmatter.aliases !== undefined && { aliases: frontmatter.aliases }),
    html: absolutizeMedia(rendered, dir, postPath(ref)),
    markdown: body.trim(),
  };
}

export function postPaths(postsDir: string): string[] {
  return readdirSync(postsDir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile() && d.name === "index.md")
    .map((d) => join(d.parentPath, d.name))
    .toSorted();
}

export async function loadPosts(postsDir: string, embedsFile: string): Promise<Post[]> {
  const paths = postPaths(postsDir);
  const sources = paths.map((p) => readFileSync(p, "utf8"));
  const urls = sources.flatMap((s) => collectEmbedUrls(s));
  const embeds = await ensureEmbeds(urls, embedsFile);
  return paths.map((p, i) => parsePost(postsDir, p, sources[i]!, embeds));
}
