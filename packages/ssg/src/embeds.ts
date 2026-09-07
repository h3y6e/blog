import { readFileSync, writeFileSync } from "node:fs";
import type { EmbedMap, EmbedMeta } from "./shortcodes.ts";

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, ent: string) => {
    if (ent.startsWith("#")) {
      const code =
        ent[1]?.toLowerCase() === "x" ? parseInt(ent.slice(2), 16) : parseInt(ent.slice(1), 10);
      return Number.isNaN(code) ? whole : String.fromCodePoint(code);
    }
    return NAMED_ENTITIES[ent.toLowerCase()] ?? whole;
  });
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    out[m[1]!.toLowerCase()] = decodeEntities((m[2] ?? m[3])!);
  }
  return out;
}

export function extractEmbedMeta(html: string, pageUrl: string): EmbedMeta {
  const meta: Record<string, string> = {};
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attrs(m[0]);
    const key = a.property ?? a.name;
    if (key !== undefined && a.content !== undefined) meta[key] ??= a.content;
  }
  const title =
    meta["og:title"] ??
    decodeEntities(/<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? "").trim();
  const image = meta["og:image"];
  return {
    image: image ? new URL(image, pageUrl).href : "",
    title,
    description: meta["og:description"] ?? meta.description ?? "",
  };
}

export async function fetchEmbedMeta(url: string): Promise<EmbedMeta> {
  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch (cause) {
    throw new Error(`failed to fetch embed metadata for ${url}: ${String(cause)}`, { cause });
  }
  if (!res.ok) throw new Error(`failed to fetch embed metadata for ${url}: HTTP ${res.status}`);
  return extractEmbedMeta(await res.text(), url);
}

export async function ensureEmbeds(
  urls: Iterable<string>,
  embedsFile: string,
  fetchMeta: (url: string) => Promise<EmbedMeta> = fetchEmbedMeta,
): Promise<EmbedMap> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, typescript/consistent-type-assertions
  const embeds = JSON.parse(readFileSync(embedsFile, "utf8")) as EmbedMap;
  const missing = [...new Set(urls)].filter((url) => !(url in embeds));
  if (missing.length === 0 || process.env.CI) return embeds;
  await Promise.all(
    missing.map(async (url) => {
      embeds[url] = await fetchMeta(url);
      console.warn(`[ssg] fetched embed metadata for ${url} — commit ${embedsFile}`);
    }),
  );
  const sorted = Object.fromEntries(
    Object.entries(embeds).toSorted(([a], [b]) => (a < b ? -1 : 1)),
  );
  writeFileSync(embedsFile, `${JSON.stringify(sorted, null, 2)}\n`);
  return embeds;
}
