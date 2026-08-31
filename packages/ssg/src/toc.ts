import { raw, type Raw } from "./html.ts";

export type Heading = {
  level: number;
  id: string;
  text: string;
};

/** Extract h2/h3 headings (Franklin's mintoclevel/maxtoclevel) from rendered HTML. */
export function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>(.*?)<\/h\1>/gs;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    // All three capture groups participate in any match.
    headings.push({
      level: Number(m[1]),
      id: m[2]!,
      text: m[3]!.replace(/<[^>]*>/g, ""),
    });
  }
  return headings;
}

// id and text come out of already-escaped rendered HTML; do not re-escape.
const link = (h: Heading): string => `<a href="#${h.id}">${h.text}</a>`;

type TocItem = { heading: Heading; subs: Heading[] };

/** Table of contents matching Franklin's .franklin-toc markup; null when no headings. */
export function toc(body: string): Raw | null {
  const headings = extractHeadings(body);
  if (headings.length === 0) return null;

  // Group h3s under the nearest preceding h2. An h3 before any h2 has
  // nothing to nest under, so it becomes its own top-level entry.
  const items: TocItem[] = [];
  let currentH2: TocItem | undefined;
  for (const h of headings) {
    if (h.level === 2) {
      currentH2 = { heading: h, subs: [] };
      items.push(currentH2);
    } else if (currentH2) {
      currentH2.subs.push(h);
    } else {
      items.push({ heading: h, subs: [] });
    }
  }

  const out = items
    .map(({ heading, subs }) => {
      const nested = subs.length
        ? `<ol>${subs.map((s) => `<li>${link(s)}</li>`).join("")}</ol>`
        : "";
      return `<li>${link(heading)}${nested}</li>`;
    })
    .join("");
  return raw(`<div class="franklin-toc"><ol>${out}</ol></div>`);
}
