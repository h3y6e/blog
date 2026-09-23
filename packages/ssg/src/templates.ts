import { enhanceFootnotes } from "./footnotes.ts";
import { html, raw, type Raw } from "./html.ts";
import { toc } from "./toc.ts";
import type { Post, SiteConfig } from "./types.ts";
import {
  byDateDesc,
  postDir,
  postFullUrl,
  postPath,
  postScriptUrl,
  postStyleUrl,
  tagPath,
  tagsIndexPath,
  typePath,
  typesIndexPath,
} from "./urls.ts";

const identityLinks = [
  { href: "https://x.com/h3y6e", rel: "me" },
  { href: "https://github.com/h3y6e", rel: "me" },
  { href: "https://gitlab.com/h3y6e", rel: "me" },
  { href: "https://codeberg.org/h3y6e", rel: "me" },
  { href: "https://h3y6e.com", rel: "me" },
  { href: "https://fedibird.com/@h3y6e", rel: "me" },
  { href: "https://bsky.app/profile/h3y6e.bsky.social", rel: "me atproto" },
  { href: "https://www.threads.com/@h3y6e", rel: "me" },
  { href: "https://njump.me/_@h3y6e.com", rel: "me" },
  { href: "https://mixi.social/@h3y6e", rel: "me" },
  { href: "https://www.instagram.com/h3y6e/", rel: "me" },
] as const;

type PageMeta = {
  title: string;
  description: string;
  ogDescription?: string;
  ogType: "article" | "website";
  ogUrl: string;
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  preconnect?: string[];
  stylesheet?: string;
  redirect?: string;
};

export function scriptOrigins(pageHtml: string): string[] {
  const origins = new Set<string>();
  for (const m of pageHtml.matchAll(/<script[^>]*\ssrc="((?:https:)?\/\/[^"/]+)/g)) {
    origins.add(m[1]!.startsWith("//") ? `https:${m[1]!}` : m[1]!);
  }
  return [...origins];
}

const PRELOADED_FONTS = ["a5ebecMono-Regular.woff2", "a5ebecMono-Bold.woff2"];

/** OG image only; the page draws the same brackets in CSS so they can animate. */
const typeLabel = (type: string): string => `[${type}]`;

const encodeCloudinary = (text: string): string =>
  encodeURI(text.replaceAll(",", "%2C").replaceAll("/", "%2F")).replaceAll("#", "%23");

export function ogImageUrl(post: Pick<Post, "title" | "date" | "type" | "tags">): string {
  const title = encodeCloudinary(post.title);
  const date = encodeCloudinary(`${post.date} ${typeLabel(post.type)}`);
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

// vt.js must be parser-blocking: its pagereveal listener has to exist before reveal.
function head(site: SiteConfig, meta: PageMeta): Raw {
  return html`<head prefix="og: https://ogp.me/ns#">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      document.documentElement.style.colorScheme = localStorage.getItem("theme") || "dark";
    </script>
    <meta name="author" content="${site.author}" />
    <meta name="fediverse:creator" content="@h3y6e@fedibird.com" />
    <link type="text/plain" rel="author" href="https://h3y6e.com/humans.txt" />
    <link rel="webmention" href="https://webmention.io/h3y6e.com/webmention" />
    <link rel="pingback" href="https://webmention.io/h3y6e.com/xmlrpc" />
    ${identityLinks.map((link) => html`<link rel="${link.rel}" href="${link.href}" />`)}
    <meta name="theme-color" content="#2f2f2f" />
    ${(meta.preconnect ?? []).map((origin) => html`<link rel="preconnect" href="${origin}" />`)}
    ${PRELOADED_FONTS.map(
      (file) =>
        html`<link rel="preload" href="/fonts/${file}" as="font" type="font/woff2" crossorigin />`,
    )}
    <link rel="stylesheet" href="/css/a5ebec.css" />
    ${meta.stylesheet && html`<link rel="stylesheet" href="${meta.stylesheet}" />`}
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.png" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta property="og:site_name" content="${site.title}" />
    <meta property="og:image" content="${meta.ogImage}" />
    <meta name="twitter:card" content="${meta.twitterCard}" />
    <meta name="twitter:site" content="@h3y6e" />
    <meta name="twitter:creator" content="@h3y6e" />
    ${
      meta.redirect === undefined
        ? html`<link rel="canonical" href="${meta.ogUrl}" />`
        : html`<link rel="canonical" href="${meta.redirect}" />
            <meta http-equiv="refresh" content="0; url=${meta.redirect}" />`
    }
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}" />
    <meta property="og:type" content="${meta.ogType}" />
    <meta property="og:title" content="${meta.title}" />
    <meta property="og:url" content="${meta.ogUrl}" />
    <meta property="og:description" content="${meta.ogDescription ?? meta.description}" />
    ${(site.originTrials ?? []).map(
      (t) => html`<meta http-equiv="origin-trial" content="${t.token}" />`,
    )}
    <script type="application/ld+json">
      ${raw(
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.author,
          alternateName: ["heyhoe", "へいほぅ", "h3y6e"],
          url: site.authorUrl,
          sameAs: identityLinks.map((link) => link.href),
        }),
      )}
    </script>
    <script src="/libs/client/vt.js"></script>
    <script type="speculationrules">
      {
        "moderate_viewport_heuristics": {
          "distance_from_pointer_down": [-0.5, 0.2],
          "largest_anchor_threshold": 0.1,
          "delay": 200
        },
        "prerender": [
          {
            "where": {
              "href_matches": ["/", "/posts/*", "/${site.tagPath}/*", "/${site.typePath}/*"]
            },
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
      <div class="header-logo h-card">
        <a class="u-url u-uid p-name" href="${site.siteUrl}/" rel="me"
          ><div class="logo">${site.title}</div></a
        >
        <a class="p-author h-card" href="${site.authorUrl}" hidden>${site.author}</a>
      </div>
      <label for="menu-trigger" class="menu">menu</label>
    </div>
    <input type="checkbox" id="menu-trigger" />
    <nav>
      <ul>
        <li><a href="https://x.com/h3y6e" rel="me">X</a></li>
        <li><a href="https://github.com/h3y6e" rel="me">GitHub</a></li>
        <li><a href="${site.authorUrl}" rel="me">About</a></li>
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
  type: string | null,
  tags: string[],
  named = false,
): Raw {
  const titleHtml = named
    ? html`<span class="p-name" style="view-transition-name: post-title">${title}</span>`
    : title;
  const typeLink = type && html` <a class="type" href="${typePath(site, type)}">${type}</a>`;
  return html`<div class="franklin-headline">
    <h1 class="title">${titleHtml}</h1>
    ${
      date &&
      html`<div class="date">
        <time class="dt-published" datetime="${date}">${date}</time>${typeLink}
      </div>`
    }<span class="tags"
      >${tags.map((tag) => html`<a href="${tagPath(site, tag)}">#${tag}</a> `)}</span
    >
  </div>`;
}

export function postlist(site: SiteConfig, posts: Post[]): Raw {
  return raw(
    byDateDesc(posts)
      .map((post) => {
        const url = postPath(post);
        const linkTitle = html`<a href="${url}">${post.title}</a>`;
        return html`<div class="postlist">
          ${headline(site, linkTitle, post.date, post.type, post.tags)}
          <p>${post.rssDescription}</p>
          <a class="read-more" href="${url}">Read more →</a>
        </div> `.html;
      })
      .join(""),
  );
}

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
      const url = postFullUrl(site, post);
      const twitter = `https://x.com/intent/tweet?text=${escapeUri(`Reading @h3y6e's ${url}`)}`;
      const elk = `https://elk.zone/intent/post?text=${escapeUri(
        `Reading @h3y6e@fedibird.com's ${url}`,
      )}`;
      return html`<p>
          Comment on <a href="${twitter}">X</a> /
          <a href="${elk}">Mastodon</a>
        </p>
        <p>
          <a
            href="https://github.com/h3y6e/blog/blob/master/site/${site.postsDir}/${postDir(post)}/index.md"
          >
            ${raw("&#xE0A0;")} Edit this page on GitHub
          </a>
        </p> `;
    })();
  return html`<footer class="page-foot">
    ${intents}
    <div class="copyright h-card">
      <span>
        ${raw("&copy;")} 2019-${new Date().getFullYear()}
        <a class="p-name u-url" href="${site.authorUrl}" rel="me">${site.author}</a>
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
        <script type="module" src="/libs/client/switcher.js"></script>
        <script type="module" src="/libs/client/webmcp.js"></script>
      </body>
    </html> `.html;
}

export function postPage(site: SiteConfig, post: Post): string {
  const meta: PageMeta = {
    title: `${post.title} :: ${site.title}`,
    description: post.rssDescription,
    ogType: "article",
    ogUrl: postFullUrl(site, post),
    ogImage: post.cover ? `${site.siteUrl}${postPath(post)}${post.cover}` : ogImageUrl(post),
    twitterCard: "summary_large_image",
    preconnect: scriptOrigins(post.html),
    ...(post.style && { stylesheet: postStyleUrl(post) }),
  };
  const url = postFullUrl(site, post);
  const body = html`<div class="reading-progress"></div>
    <div class="franklin-content h-entry">
      ${headline(site, post.title, post.date, post.type, post.tags, true)} ${toc(post.html)}
      <a class="p-author h-card" href="${site.authorUrl}" hidden>${site.author}</a>
      <a class="u-url" href="${url}" hidden>${url}</a>
      <div class="e-content">${raw(enhanceFootnotes(post.html))}</div>
      ${pageFoot(site, post)}
    </div>
    ${post.script && html`<script type="module" src="${postScriptUrl(post)}"></script>`}`;
  return layout(site, meta, body);
}

export function redirectPage(site: SiteConfig, post: Post): string {
  const url = postPath(post);
  const meta: PageMeta = {
    title: `${post.title} :: ${site.title}`,
    description: post.rssDescription,
    ogType: "article",
    ogUrl: postFullUrl(site, post),
    ogImage: post.cover ? `${site.siteUrl}${url}${post.cover}` : ogImageUrl(post),
    twitterCard: "summary_large_image",
    redirect: url,
  };
  const body = html`<div class="franklin-content">
    <p>Moved to <a href="${url}">${url}</a></p>
    ${pageFoot(site)}
  </div>`;
  return layout(site, meta, body);
}

export function indexPage(site: SiteConfig, posts: Post[]): string {
  const meta: PageMeta = {
    title: site.title,
    description: site.description,
    ogType: "website",
    ogUrl: `${site.siteUrl}/`,
    ogImage: `${site.siteUrl}/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`<div class="franklin-content">${postlist(site, posts)} ${pageFoot(site)}</div>`;
  return layout(site, meta, body);
}

export function listPage(site: SiteConfig, title: string, path: string, posts: Post[]): string {
  const meta: PageMeta = {
    title,
    description: `${site.description} :: ${site.title}`,
    ogDescription: site.description,
    ogType: "website",
    ogUrl: `${site.siteUrl}${path}`,
    ogImage: `${site.siteUrl}/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`<div class="franklin-content">${postlist(site, posts)} ${pageFoot(site)}</div>`;
  return layout(site, meta, body);
}

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

/** Types are a closed set, so the landing page defines each one rather than just counting it. */
export function typeTable(site: SiteConfig, posts: Post[]): Raw {
  return html`<table class="typepage">
    <tr>
      <th>count</th>
      <th>name</th>
      <th>meaning</th>
    </tr>
    ${site.postTypes.map(
      ({ name, description }) => html`<tr>
        <td class="count">${posts.filter((p) => p.type === name).length}</td>
        <td><a href="${typePath(site, name)}">${name}</a></td>
        <td>${description}</td>
      </tr>`,
    )}
  </table>`;
}

function facetIndexPage(site: SiteConfig, name: string, ogUrl: string, table: Raw): string {
  const meta: PageMeta = {
    title: `${name} :: ${site.title}`,
    description: site.description,
    ogType: "website",
    ogUrl,
    ogImage: `${site.siteUrl}/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`${headline(site, name, null, null, [])}
    <div class="franklin-content">${table} ${pageFoot(site)}</div>`;
  return layout(site, meta, body);
}

export function tagsIndexPage(site: SiteConfig, posts: Post[]): string {
  return facetIndexPage(
    site,
    "Tags",
    `${site.siteUrl}${tagsIndexPath(site)}`,
    tagTable(site, posts),
  );
}

export function typesIndexPage(site: SiteConfig, posts: Post[]): string {
  return facetIndexPage(
    site,
    "Types",
    `${site.siteUrl}${typesIndexPath(site)}`,
    typeTable(site, posts),
  );
}

export function notFoundPage(site: SiteConfig): string {
  const meta: PageMeta = {
    title: `404 :: ${site.title}`,
    description: site.description,
    ogType: "website",
    ogUrl: `${site.siteUrl}/404.html`,
    ogImage: `${site.siteUrl}/2f2f2f.jpg`,
    twitterCard: "summary",
  };
  const body = html`${headline(site, "404", null, null, [])}
    <div class="franklin-content">
      <h1>404: File not found</h1>
      <p>The requested file was not found.</p>
      <p>Please <a href="/">click here</a> to go to the home page.</p>
      ${pageFoot(site)}
    </div>`;
  return layout(site, meta, body);
}
