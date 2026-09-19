import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { highlight, withLineNumbers } from "@blog/hl";
import { texToMathML } from "@blog/math";
import { render } from "@blog/md";
import { ensureEmbeds } from "./embeds.ts";
import { parseFrontmatter } from "./frontmatter.ts";
import { collectEmbedUrls, type EmbedMap, expandShortcodes } from "./shortcodes.ts";
import type { Post, PostType } from "./types.ts";
import { postDir, postPath } from "./urls.ts";

const RELATIVE_SRC = /\ssrc="(?![a-z]+:|\/|#)([^"]*)"/g;

function absolutizeMedia(html: string, dir: string, urlDir: string): string {
  return html.replace(RELATIVE_SRC, (_m, src: string) => {
    if (!existsSync(join(dir, src))) throw new Error(`${dir}: media not found: ${src}`);
    return ` src="${urlDir}${src}"`;
  });
}

function parsePost(
  postsDir: string,
  path: string,
  source: string,
  embeds: EmbedMap,
  postTypes: PostType[],
): Post {
  const dir = dirname(path);
  const { frontmatter, body } = parseFrontmatter(source);
  const ref = { date: frontmatter.date, slug: basename(dir) };
  const actual = relative(postsDir, dir).split(sep).join("/");
  if (actual !== postDir(ref)) {
    throw new Error(`${path}: date ${frontmatter.date} does not match directory ${actual}`);
  }
  if (!postTypes.some((t) => t.name === frontmatter.type)) {
    throw new Error(`${path}: unknown type: ${frontmatter.type}`);
  }
  for (const tag of frontmatter.tags) {
    if (!/^[a-z0-9]+$/.test(tag)) throw new Error(`${path}: tag is not one lowercase word: ${tag}`);
  }
  if (frontmatter.cover !== undefined && !existsSync(join(dir, frontmatter.cover))) {
    throw new Error(`${path}: cover not found: ${frontmatter.cover}`);
  }
  const script = join(dir, "index.ts");
  const style = join(dir, "index.css");
  const rendered = render(expandShortcodes(body, embeds), {
    math: texToMathML,
    highlight: (code, lang) => withLineNumbers(highlight(code, lang)),
  });
  return {
    ...ref,
    title: frontmatter.title,
    type: frontmatter.type,
    tags: frontmatter.tags,
    rssDescription: frontmatter.rss_description,
    ...(frontmatter.cover !== undefined && { cover: frontmatter.cover }),
    ...(frontmatter.aliases !== undefined && { aliases: frontmatter.aliases }),
    ...(existsSync(script) && { script }),
    ...(existsSync(style) && { style }),
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

export type PostEntry = { url: string; path: string };

const ENTRY_FILES: [file: string, url: string][] = [
  ["index.ts", "index.js"],
  ["index.css", "index.css"],
];

export function postEntries(postsDir: string): PostEntry[] {
  return postPaths(postsDir).flatMap((p) => {
    const dir = dirname(p);
    const urlDir = `/posts/${relative(postsDir, dir).split(sep).join("/")}/`;
    return ENTRY_FILES.flatMap(([file, url]) => {
      const path = join(dir, file);
      return existsSync(path) ? [{ url: urlDir + url, path }] : [];
    });
  });
}

export async function loadPosts(
  postsDir: string,
  embedsFile: string,
  postTypes: PostType[],
): Promise<Post[]> {
  for (const { name } of postTypes)
    if (!/^[A-Z][a-z]+$/.test(name))
      throw new Error(`postTypes: not one capitalized word: ${name}`);
  const paths = postPaths(postsDir);
  const sources = paths.map((p) => readFileSync(p, "utf8"));
  const urls = sources.flatMap((s) => collectEmbedUrls(s));
  const embeds = await ensureEmbeds(urls, embedsFile);
  return paths.map((p, i) => parsePost(postsDir, p, sources[i]!, embeds, postTypes));
}
