import { raw, type Raw } from "./html.ts";

export type Heading = {
  level: number;
  id: string;
  text: string;
};

export function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = [];
  const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>(.*?)<\/h\1>/gs;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    headings.push({
      level: Number(m[1]),
      id: m[2]!,
      text: m[3]!.replace(/<[^>]*>/g, ""),
    });
  }
  return headings;
}

const link = (h: Heading): string => `<a href="#${h.id}">${h.text}</a>`;

type TocItem = { heading: Heading; subs: Heading[] };

export function toc(body: string): Raw | null {
  const headings = extractHeadings(body);
  if (headings.length === 0) return null;

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
