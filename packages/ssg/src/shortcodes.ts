/**
 * Franklin shortcode expansion, applied to post markdown before rendering:
 * - `{{ embed <url> [label] }}` → link-preview card (port of hfun_embed; the
 *   label was ignored there too). Card metadata comes from a cached map (see
 *   embeds.ts, which self-populates it locally) so CI builds stay offline and
 *   deterministic; `null` records a URL whose page was unreachable at harvest
 *   time (Franklin rendered nothing for those).
 * - `\figure{src}{caption}` → figure element (port of the \figure newcommand).
 *
 * Both are only recognized as full lines, matching how the posts use them;
 * indented (4-space) code-block lines and fenced (```) code blocks are left
 * alone, so a post documenting this syntax in an example doesn't get it
 * expanded.
 */

import { escapeHtml } from "./html.ts";

const FENCE = /^(`{3,})(.*)$/;

/** Marks each line as inside a fenced code block, mirroring @blog/md's own
 * fence tracking so shortcode syntax in a fenced example is never expanded. */
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
  return (
    `<div class="embed" ontouchstart="">` +
    `<img src="${escapeHtml(meta.image)}" decoding="async" loading="lazy">` +
    `<div class="embed-content">` +
    `<b>${escapeHtml(meta.title)}</b>` +
    `<p>${escapeHtml(meta.description)}</p>` +
    `<div class="domain">${new URL(url).host}</div>` +
    `</div>` +
    `<a href="${escapeHtml(url)}" rel="noopener noreferrer nofollow" target="_blank" role="link"></a>` +
    `</div>`
  );
}

/** URLs referenced by embed shortcodes, in order of appearance. */
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
      // Capture groups in EMBED and FIGURE always participate in a match.
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
