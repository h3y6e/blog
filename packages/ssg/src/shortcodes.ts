import { escapeHtml } from "./html.ts";

const FENCE = /^(`{3,})(.*)$/;

function fenceMask(lines: string[]): boolean[] {
  let inFence: string | null = null;
  return lines.map((line) => {
    const fence = FENCE.exec(line);
    if (fence) inFence = inFence === null ? fence[1]! : null;
    return inFence !== null;
  });
}

export type EmbedMeta = {
  image: string;
  title: string;
  description: string;
};

export type EmbedMap = Record<string, EmbedMeta | null>;

const EMBED = /^\{\{ embed (\S+)(?: .*)? \}\}$/;
const FIGURE = /^\\figure\{([^}]*)\}\{([^}]*)\}$/;

function embedCard(url: string, embeds: EmbedMap): string {
  const meta = embeds[url];
  if (meta === undefined) {
    throw new Error(`no embed metadata for ${url}; add it to the embeds file`);
  }
  if (meta === null) return "";
  const img = meta.image
    ? `<img src="${escapeHtml(meta.image)}" decoding="async" loading="lazy">`
    : "";
  return (
    `<div class="embed" ontouchstart="">` +
    img +
    `<div class="embed-content">` +
    `<b>${escapeHtml(meta.title)}</b>` +
    `<p>${escapeHtml(meta.description)}</p>` +
    `<div class="domain">${new URL(url).host}</div>` +
    `</div>` +
    `<a href="${escapeHtml(url)}" rel="noopener noreferrer nofollow" target="_blank" role="link"></a>` +
    `</div>`
  );
}

export function collectEmbedUrls(markdown: string): string[] {
  const lines = markdown.split("\n");
  const fenced = fenceMask(lines);
  return lines.flatMap((line, i) => (fenced[i] ? [] : (EMBED.exec(line)?.[1] ?? [])));
}

export function expandShortcodes(markdown: string, embeds: EmbedMap): string {
  const lines = markdown.split("\n");
  const fenced = fenceMask(lines);
  return lines
    .map((line, i) => {
      if (fenced[i]) return line;
      let m = EMBED.exec(line);
      if (m) return embedCard(m[1]!, embeds);
      m = FIGURE.exec(line);
      if (m) {
        return `<figure><img src="${escapeHtml(m[1]!)}" /><figcaption>${escapeHtml(m[2]!)}</figcaption></figure>`;
      }
      return line;
    })
    .join("\n");
}
