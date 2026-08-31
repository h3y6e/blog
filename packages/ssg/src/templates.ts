/**
 * Page templates ported from the Franklin _layout: same class names
 * (.franklin-headline, .franklin-content, .postlist, .tagpage, ...) and asset
 * URLs (/css/a5ebec.css, /libs/theme/scripts/*) so the existing CSS and theme
 * scripts keep working.
 */

import { enhanceFootnotes } from "./footnotes.ts";
import { html, raw, type Raw } from "./html.ts";
import { toc } from "./toc.ts";
import type { Post, SiteConfig } from "./types.ts";
import {
  byDateDesc,
  postFullUrl,
  postPath,
  tagFullUrl,
  tagPath,
  tagsIndexFullUrl,
} from "./urls.ts";

type PageMeta = {
  title: string;
  description: string;
  /** Falls back to `description` when omitted; only tagPage diverges, since
   * its <meta name="description"> carries a " :: site title" suffix that
   * og:description never had. */
  ogDescription?: string;
  ogType: "article" | "website";
  ogUrl: string;
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  /** Third-party origins the page will hit early (embedded scripts). */
  preconnect?: string[];
};

/** Origins of third-party scripts embedded in the page, for preconnect. */
export function scriptOrigins(pageHtml: string): string[] {
  const origins = new Set<string>();
  for (const m of pageHtml.matchAll(/<script[^>]*\ssrc="((?:https:)?\/\/[^"/]+)/g)) {
    origins.add(m[1]!.startsWith("//") ? `https:${m[1]!}` : m[1]!);
  }
  return [...origins];
}

// Mirrors site/ogimage.ts's encode(), which is verified byte-identical to
// the legacy @cloudinary/url-gen output (site/ogimage.test.ts). encodeURI
// leaves ,/#&;:@=+$? unescaped, so those are handled explicitly; kept in
// sync manually since site/ (the consumer) can't be imported from here.
const encodeCloudinary = (text: string): string =>
  encodeURI(text.replaceAll(",", "%2C").replaceAll("/", "%2F")).replaceAll("#", "%23");

/** Port of hfun_ogimage_url: Cloudinary-generated OGP image for posts without a cover. */
export function ogImageUrl(post: Pick<Post, "title" | "date" | "tags">): string {
  const title = encodeCloudinary(post.title);
  const date = encodeCloudinary(post.date);
  const tags = encodeCloudinary(post.tags.map((t) => `#${t}`).join(" "));
  return (
    "https://res.cloudinary.com/dzugrdlkb/image/upload/" +
    `c_fit,w_840,co_rgb:a5ebec,l_text:Firge35-Bold.ttf_50:${title}/` +
    "fl_layer_apply,g_south_west,x_180,y_355/" +
    `co_rgb:a5ebec7f,l_text:Firge35-Regular.ttf_30:${date}/` +
    "fl_layer_apply,g_north_west,x_180,y_565/" +
    `c_fit,w_840,co_rgb:d3d5d57f,l_text:Firge35-Regular.ttf_30:${tags}/` +
    "fl_layer_apply,g_north_west,x_180,y_605/a5ebec-ogimage-left.png"
  );
}

function head(site: SiteConfig, meta: PageMeta): Raw {
  return html`<head prefix="og: https://ogp.me/ns#">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      document.documentElement.style.colorScheme = localStorage.getItem("theme") || "dark";
    </script>
    <meta name="author" content="${site.author}" />
    <link type="text/plain" rel="author" href="https://h3y6e.com/humans.txt" />
    <link rel="webmention" href="https://webmention.io/h3y6e.com/webmention" />
    <link rel="pingback" href="https://webmention.io/h3y6e.com/xmlrpc" />
    <link rel="me" href="https://fedibird.com/@h3y6e" />
    <link rel="me" href="https://www.threads.net/@h3y6e" />
    <meta name="theme-color" content="#2f2f2f" />
    ${(meta.preconnect ?? []).map((origin) => html`<link rel="preconnect" href="${origin}" />`)}
    <link
      rel="preload"
      href="/css/fonts/FiraCode-Regular.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link
      rel="preload"
      href="/css/fonts/FiraCode-Bold.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    />
    <link rel="stylesheet" href="/css/a5ebec.css" />
    <link rel="icon" href="/assets/favicon/favicon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png" />
    <meta property="og:site_name" content="${site.title}" />
    <meta property="og:image" content="${meta.ogImage}" />
    <meta name="twitter:card" content="${meta.twitterCard}" />
    <meta name="twitter:site" content="@h3y6e" />
    <meta name="twitter:creator" content="@h3y6e" />
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta property="og:type" content="${meta.ogType}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:url" content="${meta.ogUrl}" />
    <meta property="og:description" content="${meta.ogDescription ?? meta.description}" />
    ${(site.originTrials ?? []).map(
      (t) => html`<meta http-equiv="origin-trial" content="${t.token}" />`,
    )}
    <script type="speculationrules">
      {
        "prerender": [
          {
            "where": { "href_matches": ["/posts/*", "/${site.tagPath}/*"] },
            "eagerness": "moderate"
          }
        ]
      }
    </script>
  </head>`;
}

function header(site: SiteConfig): Raw {
  return html`<header>
    <div class="header-inner">
      <div class="header-logo">
        <a href="/"><div class="logo">${site.title}</div></a>
      </div>
      <label for="menu-trigger" class="menu">menu</label>
    </div>
    <input type="checkbox" id="menu-trigger" />
    <nav>
      <ul>
        <li><a href="https://twitter.com/h3y6e" rel="me">Twitter</a></li>
        <li><a href="https://github.com/h3y6e" rel="me">GitHub</a></li>
        <li><a href="/feed.xml">RSS</a></li>
        <li class="theme-switcher"><button id="theme-switcher">Theme</button></li>
      </ul>
    </nav>
  </header>`;
}

export function headline(
  site: SiteConfig,
  title: Raw | string,
  date: string | null,
  tags: string[],
  named = false,
): Raw {
  // The article title carries the shared "post-title" name on an inline span
  // (same geometry as the list link); the list side gets the name at
  // navigation time from vt.ts, so only the involved title ever morphs.
  const titleHtml = named
    ? html`<span style="view-transition-name: post-title">${title}</span>`
    : title;
  return html`<div class="franklin-headline">
    <h1 class="title">${titleHtml}</h1>
    ${date && html`<div class="date">${date}</div>`}<span class="tags"
      >${tags.map((tag) => html`<a href="${tagPath(site, tag)}">#${tag}</a> `)}</span
    >
  </div>`;
}

export function postlist(site: SiteConfig, posts: Post[]): Raw {
  return raw(
    byDateDesc(posts)
      .map((post) => {
        const url = postPath(post.slug);
        const linkTitle = html`<a href="${url}">${post.title}</a>`;
        return html`<div class="postlist">
          ${headline(site, linkTitle, post.date, post.tags)}
          <p>${post.rssDescription}</p>
          <a class="read-more" href="${url}">Read more →</a>
        </div> `.html;
      })
      .join(""),
  );
}

/** Like encodeURIComponent but also encodes !'()* — matches Julia's escapeuri
 * so intent URLs keep the exact %27 form of the live site. */
function escapeUri(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function pageFoot(site: SiteConfig, post?: Post): Raw {
  const intents =
    post &&
    ((): Raw => {
      const url = postFullUrl(site, post.slug);
      const twitter = `https://twitter.com/intent/tweet?text=${escapeUri(
        `Reading @h3y6e's ${url}`,
      )}`;
      const elk = `https://elk.zone/intent/post?text=${escapeUri(
        `Reading @h3y6e@threads.net's ${url}`,
      )}`;
      return html`<p>
          Comment on <a href="${twitter}">Twitter</a> /
          <a href="${elk}">Mastodon</a>
        </p>
        <p>
          <a href="https://github.com/h3y6e/blog/blob/master/site/${site.postsDir}/${post.slug}.md">
            ${raw("&#xE0A0;")} Edit this page on GitHub
          </a>
        </p> `;
    })();
  return html`<footer class="page-foot">
    ${intents}
    <div class="copyright">
      <span>
        ${raw("&copy;")} 2019-${new Date().getFullYear()}
        <a href="${site.authorUrl}">${site.author}</a>
      </span>
    </div>
  </footer>`;
}

function layout(site: SiteConfig, meta: PageMeta, body: Raw): string {
  return html`<!DOCTYPE html>
    <html lang="ja">
      ${head(site, meta)}
      <body>
        ${header(site)} ${body}
        <script type="module" src="/libs/theme/scripts/switcher.js"></script>
        <script type="module" src="/libs/theme/scripts/vt.js"></script>
      </body>
    </html> `.html;
}

export function postPage(site: SiteConfig, post: Post): string {
  const meta: PageMeta = {
    title: `${post.title} :: ${site.title}`,
    description: post.rssDescription,
    ogType: "article",
    ogUrl: postFullUrl(site, post.slug),
    ogImage: post.cover ? `${site.siteUrl}${post.cover}` : ogImageUrl(post),
    twitterCard: "summary_large_image",
    preconnect: scriptOrigins(post.html),
  };
  const body = html`<div class="reading-progress"></div>
    ${headline(site, post.title, post.date, post.tags, true)} ${toc(post.html)}
    <div class="franklin-content">
      ${raw(enhanceFootnotes(post.html))} ${pageFoot(site, post)}
    </div>`;
  return layout(site, meta, body);
}

export function indexPage(site: SiteConfig, posts: Post[]): string {
  const meta: PageMeta = {
    title: site.title,
    description: site.description,
    ogType: "website",
    ogUrl: `${site.siteUrl}/index.html`,
    ogImage: `${site.siteUrl}/assets/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`<div class="franklin-content">${postlist(site, posts)} ${pageFoot(site)}</div>`;
  return layout(site, meta, body);
}

export function tagPage(site: SiteConfig, tag: string, posts: Post[]): string {
  const meta: PageMeta = {
    title: `Tag: #${tag}`,
    description: `${site.description} :: ${site.title}`,
    ogDescription: site.description,
    ogType: "website",
    ogUrl: tagFullUrl(site, tag),
    ogImage: `${site.siteUrl}/assets/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`<div class="franklin-content">${postlist(site, posts)} ${pageFoot(site)}</div>`;
  return layout(site, meta, body);
}

/** Port of hfun_tagpage: tags grouped into table rows by post count. */
export function tagTable(site: SiteConfig, posts: Post[]): Raw {
  const counts = new Map<string, number>();
  for (const post of posts)
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const sorted = [...counts.entries()]
    .toSorted(([a], [b]) => a.localeCompare(b))
    .toSorted(([, a], [, b]) => b - a);
  let out = `<table class="tagpage">\n<tr><th>count</th><th>name</th></tr>`;
  let current = -1;
  for (const [tag, count] of sorted) {
    if (count !== current) {
      if (current !== -1) out += `</td></tr>`;
      out += `\n<tr><td class="count">${count}</td>\n<td class="block">\n`;
      current = count;
    }
    out += html`<a href="${tagPath(site, tag)}">#${tag}</a> `.html;
  }
  out += `</td></tr></table>`;
  return raw(out);
}

export function tagsIndexPage(site: SiteConfig, posts: Post[]): string {
  const meta: PageMeta = {
    title: `Tags :: ${site.title}`,
    description: site.description,
    ogType: "website",
    ogUrl: tagsIndexFullUrl(site),
    ogImage: `${site.siteUrl}/assets/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`${headline(site, "Tags", null, [])}
    <div class="franklin-content">${tagTable(site, posts)} ${pageFoot(site)}</div>`;
  return layout(site, meta, body);
}

export function notFoundPage(site: SiteConfig): string {
  const meta: PageMeta = {
    title: `404 :: ${site.title}`,
    description: site.description,
    ogType: "website",
    ogUrl: `${site.siteUrl}/404.html`,
    ogImage: `${site.siteUrl}/assets/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`${headline(site, "404", null, [])}
    <div class="franklin-content">
      <h1>404: File not found</h1>
      <p>The requested file was not found.</p>
      <p>Please <a href="/">click here</a> to go to the home page.</p>
      ${pageFoot(site)}
    </div>`;
  return layout(site, meta, body);
}
