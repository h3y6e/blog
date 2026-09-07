import type { Post, SiteConfig } from "./types.ts";
import { byDateDescFeed, postFullUrl } from "./urls.ts";

export function franklinEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/\(/g, "&#40;")
    .replace(/\)/g, "&#41;")
    .replace(/\+/g, "&#43;")
    .replace(/\[/g, "&#91;")
    .replace(/\]/g, "&#93;")
    .replace(/_([^_]+)_/g, "<em>$1</em>");
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function rfc1123(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${DAYS[d.getUTCDay()]}, ${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} 00:00:00 +0000`;
}

export function renderItem(site: SiteConfig, post: Post): string {
  const url = postFullUrl(site, post.slug);
  return (
    "<item>\n" +
    "  <title>\n" +
    `    <![CDATA[  ${franklinEscape(post.title)}  ]]>\n` +
    "  </title>\n" +
    `  <link> ${url} </link>\n` +
    `  <guid> ${url} </guid>\n` +
    "  <description>\n" +
    `    <![CDATA[  ${franklinEscape(post.rssDescription)}  ]]>\n` +
    "  </description>  \n" +
    "    \n" +
    `  <pubDate>${rfc1123(post.date)}</pubDate>  \n` +
    "  \n" +
    "  \n" +
    "  <atom:author>\n" +
    `    <atom:name>${site.author}</atom:name>\n` +
    "  </atom:author>\n" +
    "        \n" +
    "</item>\n"
  );
}

export function renderFeed(site: SiteConfig, posts: Post[]): string {
  const head = `<?xml version="1.0" encoding="UTF-8"?>

<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:georss="http://www.georss.org/georss">

  <channel>
    <title>
      <![CDATA[  ${franklinEscape(site.title)}  ]]>
    </title>
    <link> ${site.siteUrl} </link>
    <description>
      <![CDATA[  ${franklinEscape(site.description)}  ]]>
    </description>
    <atom:link
      href="${site.siteUrl}/feed.xml"
      rel="self"
      type="application/rss+xml" />

`;
  const items = byDateDescFeed(posts)
    .map((post) => `\n${renderItem(site, post)}`)
    .join("");
  return `${head}${items}</channel></rss>`;
}
