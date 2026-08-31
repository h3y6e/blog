/**
 * Build-time media enhancement, applied to every HTML page before asset-URL
 * rewriting (dimensions are keyed by canonical URL):
 * - `width`/`height` from the image bytes, so the browser reserves the box
 *   before a single byte arrives (no layout shift).
 * - The first image a reader can hit is the LCP candidate and gets
 *   `fetchpriority="high"`; everything after it lazy-loads. An author-written
 *   `loading`/`fetchpriority` attribute always wins.
 * - `loading="lazy"` on iframes.
 *
 * Escaped markup in code blocks is untouched: the tag regexes only match a
 * literal `<`, never `&lt;`.
 */

export type Dims = { width: number; height: number };

/** Dimensions parsed from PNG/JPEG/GIF headers; null for other formats. */
export function imageSize(buf: Uint8Array): Dims | null {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (buf.length >= 24 && view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a) {
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (buf.length >= 10 && view.getUint32(0) === 0x47494638) {
    return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
  }
  if (buf.length >= 2 && view.getUint16(0) === 0xffd8) {
    for (let i = 2; i + 4 <= buf.length;) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1]!;
      // Fill bytes and standalone markers (SOI, TEM, RSTn) carry no segment.
      if (marker === 0xff) {
        i += 1;
        continue;
      }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
        continue;
      }
      // SOS/EOI: entropy-coded data follows, no SOF was seen.
      if (marker === 0xda || marker === 0xd9) return null;
      const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof && i + 9 <= buf.length) {
        return { width: view.getUint16(i + 7), height: view.getUint16(i + 5) };
      }
      i += 2 + view.getUint16(i + 2);
    }
  }
  return null;
}

const MEDIA_TAG = /<(img|iframe)\b[^>]*>/g;
const SRC = /\ssrc="([^"]*)"/;
const LOADING_HINT = /\s(?:loading|fetchpriority)="([^"]*)"/;

function withAttrs(tag: string, attrs: string): string {
  return tag.endsWith("/>")
    ? `${tag.slice(0, -2).trimEnd()}${attrs} />`
    : `${tag.slice(0, -1)}${attrs}>`;
}

export function enhanceMedia(html: string, dims: Map<string, Dims>): string {
  let first = true;
  return html.replace(MEDIA_TAG, (tag, name: string) => {
    if (name === "iframe") {
      return /\sloading=/.test(tag) ? tag : withAttrs(tag, ' loading="lazy"');
    }
    let out = tag;
    if (!/\swidth=/.test(out)) {
      const src = SRC.exec(out)?.[1];
      const d = src === undefined ? undefined : dims.get(src);
      if (d) out = withAttrs(out, ` width="${d.width}" height="${d.height}"`);
    }
    const hint = LOADING_HINT.exec(out)?.[1];
    if (hint === undefined) {
      out = withAttrs(
        out,
        first ? ' fetchpriority="high" decoding="async"' : ' loading="lazy" decoding="async"',
      );
      first = false;
    } else if (hint !== "lazy") {
      // An explicit eager/fetchpriority image is the author's LCP pick.
      first = false;
    }
    return out;
  });
}
