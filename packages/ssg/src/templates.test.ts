import { describe, expect, it } from "vite-plus/test";
import { html } from "./html.ts";
import {
  headline,
  indexPage,
  notFoundPage,
  ogImageUrl,
  postlist,
  postPage,
  listPage,
  tagsIndexPage,
  tagTable,
  typeTable,
} from "./templates.ts";
import type { Post, SiteConfig } from "./types.ts";

const site: SiteConfig = {
  siteUrl: "https://blog.h3y6e.com",
  title: "#a5ebec",
  description: "へいほぅの殴り書き",
  author: "heyhoe",
  authorUrl: "https://h3y6e.com",
  postsDir: "posts",
  embedsFile: "embeds.json",
  tagPath: "tags",
  typePath: "types",
  postTypes: [
    { name: "Report", description: "r" },
    { name: "Essay", description: "e" },
  ],
};

const post = (over: Partial<Post> = {}): Post => ({
  slug: "a2net",
  title: "A2ネットを改善しよう",
  date: "2020-12-18",
  type: "Report",
  tags: ["kmnac", "adventcalendar"],
  rssDescription: "寮のネットワークを改善している話。",
  html: "<p>body</p>",
  markdown: "md",
  ...over,
});

const norm = (s: string): string => s.replace(/\s+/g, " ").replace(/ >/g, ">").trim();

describe("headline", () => {
  it("when given title, date, type and tags, puts the type on the date line and the tags in their own span", () => {
    // Act
    const out = norm(headline(site, "T", "2020-12-18", "Build", ["kmnac"]).html);
    // Assert
    expect(out).toBe(
      '<div class="franklin-headline"> <h1 class="title">T</h1> ' +
        '<div class="date">2020-12-18 <a class="type" href="/types/build/">Build</a></div>' +
        '<span class="tags"><a href="/tags/kmnac/">#kmnac</a> </span> </div>',
    );
  });

  it("when date and type are null, omits the date div but keeps the tags span", () => {
    // Act
    const out = norm(headline(site, "T", null, null, []).html);
    // Assert
    expect(out).not.toContain('class="date"');
    expect(out).toContain('<span class="tags"></span>');
  });
});

describe("postlist", () => {
  it("when rendering posts, emits .postlist blocks with linked titles and read-more links, newest first", () => {
    // Arrange
    const posts = [post(), post({ slug: "newer", title: "Newer", date: "2021-01-01", tags: [] })];
    // Act
    const out = norm(postlist(site, posts).html);
    // Assert
    expect(out.indexOf("Newer")).toBeLessThan(out.indexOf("A2ネット"));
    expect(out).toContain(
      '<div class="postlist"> <div class="franklin-headline"> ' +
        '<h1 class="title"><a href="/posts/2020/12/18/a2net/">A2ネットを改善しよう</a></h1>',
    );
    expect(out).toContain('<a class="read-more" href="/posts/2020/12/18/a2net/">Read more →</a>');
  });
});

describe("ogImageUrl", () => {
  it("when given a post, builds the Cloudinary URL with encoded title, date, type and tags", () => {
    // Act
    const url = ogImageUrl({
      title: "球化するUI",
      date: "2025-07-03",
      type: "Essay",
      tags: ["ui"],
    });
    // Assert
    expect(url).toBe(
      "https://res.cloudinary.com/dzugrdlkb/image/upload/" +
        "c_fit,w_840,co_rgb:a5ebec,l_text:Firge35-Bold.ttf_50:%E7%90%83%E5%8C%96%E3%81%99%E3%82%8BUI/" +
        "fl_layer_apply,g_south_west,x_180,y_355/" +
        "co_rgb:a5ebec7f,l_text:Firge35-Regular.ttf_30:2025-07-03%20%5BEssay%5D/" +
        "fl_layer_apply,g_north_west,x_180,y_565/" +
        "c_fit,w_840,co_rgb:d3d5d57f,l_text:Firge35-Regular.ttf_30:%23ui/" +
        "fl_layer_apply,g_north_west,x_180,y_605/a5ebec-ogimage-left.png",
    );
  });

  it("when given multiple tags, joins them with a space and percent-encodes each # and space", () => {
    // Act
    const url = ogImageUrl({ title: "t", date: "2025-07-03", type: "Guide", tags: ["a", "b"] });
    // Assert
    expect(url).toContain("l_text:Firge35-Regular.ttf_30:2025-07-03%20%5BGuide%5D/");
    expect(url).toContain("l_text:Firge35-Regular.ttf_30:%23a%20%23b/");
  });

  it("when the title contains an ampersand, matches the legacy Cloudinary encoding (unescaped, not %26)", () => {
    // Act
    const url = ogImageUrl({ title: "A & B", date: "2025-07-03", type: "Essay", tags: [] });
    // Assert
    expect(url).toContain("l_text:Firge35-Bold.ttf_50:A%20&%20B/");
    expect(url).not.toContain("%26");
  });
});

describe("postPage", () => {
  it("when the post has no cover, uses the generated OGP image and article metadata", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(page).toContain("<title>A2ネットを改善しよう :: #a5ebec</title>");
    expect(page).toContain('<meta property="og:type" content="article" />');
    expect(page).toContain(
      '<meta property="og:url" content="https://blog.h3y6e.com/posts/2020/12/18/a2net/" />',
    );
    expect(page).toContain(
      '<link rel="canonical" href="https://blog.h3y6e.com/posts/2020/12/18/a2net/" />',
    );
    expect(page).toContain("res.cloudinary.com");
    expect(page).toContain('<meta name="twitter:card" content="summary_large_image" />');
  });

  it("when the post has a cover, uses it as the absolute og:image", () => {
    // Act
    const page = postPage(site, post({ cover: "rack.jpg" }));
    // Assert
    expect(page).toContain(
      '<meta property="og:image" content="https://blog.h3y6e.com/posts/2020/12/18/a2net/rack.jpg" />',
    );
  });

  it("when the post embeds third-party scripts, emits one preconnect per script origin", () => {
    // Arrange
    const body =
      '<blockquote class="twitter-tweet"></blockquote>' +
      '<script async src="https://platform.twitter.com/widgets.js"></script>' +
      '<script async src="https://platform.twitter.com/widgets.js"></script>' +
      '<script async src="//cdn.iframe.ly/embed.js"></script>';
    // Act
    const page = postPage(site, post({ html: body }));
    // Assert
    expect(page).toContain('<link rel="preconnect" href="https://platform.twitter.com" />');
    expect(page).toContain('<link rel="preconnect" href="https://cdn.iframe.ly" />');
    expect(page.match(/rel="preconnect" href="https:\/\/platform\.twitter\.com"/g)).toHaveLength(1);
  });

  it("when the post has a script and a style, links both from the post URL; otherwise emits neither tag", () => {
    // Act
    const both = postPage(site, post({ script: "/abs/index.ts", style: "/abs/index.css" }));
    const neither = postPage(site, post());
    // Assert
    expect(both).toContain(
      '<script type="module" src="/posts/2020/12/18/a2net/index.js"></script>',
    );
    expect(both).toContain('<link rel="stylesheet" href="/posts/2020/12/18/a2net/index.css" />');
    expect(neither).not.toContain("/posts/2020/12/18/a2net/index.js");
    expect(neither).not.toContain("/posts/2020/12/18/a2net/index.css");
  });

  it("when the post embeds no third-party script, emits no preconnect", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(page).not.toContain('rel="preconnect"');
  });

  it("when rendering any page, preloads the woff2 fonts, links the png favicon, and allows pinch zoom", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(page).toContain('href="/fonts/a5ebecMono-Regular.woff2"');
    expect(page).toContain('type="font/woff2"');
    expect(page).toContain(
      '<link rel="icon" href="/assets/favicon/favicon.png" type="image/png" />',
    );
    expect(page).toContain('content="width=device-width, initial-scale=1"');
    expect(page).not.toContain("maximum-scale");
  });

  it("when the post has code, includes no client-side highlight.js script", () => {
    // Act
    const page = postPage(site, post({ html: '<pre><code class="language-ts">x</code></pre>' }));
    // Assert
    expect(page).not.toContain("/libs/highlight/");
  });

  it("when rendering any post, includes the inline theme script before the stylesheet, comment intents and the GitHub edit link", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(page).not.toContain("noflash.js");
    const themeScript = page.indexOf("localStorage.getItem");
    expect(themeScript).toBeGreaterThan(-1);
    expect(themeScript).toBeLessThan(page.indexOf('rel="stylesheet"'));
    expect(page).toContain(
      "https://x.com/intent/tweet?text=Reading%20%40h3y6e%27s%20https%3A%2F%2Fblog.h3y6e.com%2Fposts%2F2020%2F12%2F18%2Fa2net%2F",
    );
    expect(page).toContain(
      "https://elk.zone/intent/post?text=Reading%20%40h3y6e%40fedibird.com%27s%20https%3A%2F%2Fblog.h3y6e.com%2Fposts%2F2020%2F12%2F18%2Fa2net%2F",
    );
    expect(page).toContain(
      "https://github.com/h3y6e/blog/blob/master/site/posts/2020/12/18/a2net/index.md",
    );
  });

  it("when rendering a post, discovers webmentions and identity links for IndieAuth", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(page).toContain(
      '<link rel="webmention" href="https://webmention.io/h3y6e.com/webmention" />',
    );
    expect(page).toContain('<link rel="me" href="https://github.com/h3y6e" />');
    expect(page).toContain(
      '<link rel="me atproto" href="https://bsky.app/profile/h3y6e.bsky.social" />',
    );
    expect(page).toContain('<meta name="fediverse:creator" content="@h3y6e@fedibird.com" />');
    expect(page).toContain(
      'data-webmention-target="https://blog.h3y6e.com/posts/2020/12/18/a2net/"',
    );
    expect(page).toContain('href="https://blog.h3y6e.com/posts/2020/12/18/a2net/" hidden');
    expect(page).toContain('src="/libs/client/webmentions.js"');
    expect(page).toContain('"@type":"Person"');
  });

  it("when rendering any post, names an inline title span for view transitions and adds the reading progress bar", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(norm(page)).toContain(
      '<h1 class="title"><span style="view-transition-name: post-title">A2ネットを改善しよう</span></h1>',
    );
    expect(page).toContain('<div class="reading-progress"></div>');
  });

  it("when rendering the post list, no static view-transition-name is set (vt.ts names the involved link at navigation time)", () => {
    // Act
    const list = postlist(site, [post(), post({ slug: "p2" })]).html;
    // Assert
    expect(list).not.toContain("view-transition-name");
  });

  it("when rendering a post page, exactly one view-transition-name exists so the transition is never skipped by duplicates", () => {
    // Act
    const page = postPage(site, post());
    const names = [...page.matchAll(/view-transition-name: ([\w-]+)/g)].map((m) => m[1]);
    // Assert
    expect(names).toEqual(["post-title"]);
  });

  it("when rendering any page, includes speculation rules prerendering posts and tags links", () => {
    // Act
    const page = postPage(site, post());
    // Assert
    expect(page).toContain('<script type="speculationrules">');
    expect(page).toContain('"href_matches": ["/", "/posts/*", "/tags/*", "/types/*"]');
    expect(page).toContain('"moderate_viewport_heuristics"');
    expect(page).toContain('"eagerness": "moderate"');
  });

  it("when origin trials are configured, emits an origin-trial meta per token", () => {
    // Act
    const page = postPage(
      { ...site, originTrials: [{ feature: "F", token: "T==", expires: "2099-01-01" }] },
      post(),
    );
    // Assert
    expect(page).toContain('<meta http-equiv="origin-trial" content="T==" />');
  });

  it("when the post has footnotes, renders popover previews for them", () => {
    // Arrange
    const body =
      '<p>x<sup class="footnote-ref"><a href="#fn-1" id="fnref-1">1</a></sup></p>\n' +
      '<section class="footnotes">\n<ol>\n' +
      '<li id="fn-1">note <a href="#fnref-1" class="footnote-backref">↩</a></li>\n' +
      "</ol>\n</section>\n";
    // Act
    const page = postPage(site, post({ html: body }));
    // Assert
    expect(page).toContain('interestfor="fn-pop-1"');
    expect(page).toContain('<div popover="hint" id="fn-pop-1" class="footnote-popover"');
  });

  it("when a title contains HTML special characters, escapes them in the rendered page", () => {
    // Act
    const page = postPage(site, post({ title: 'x<script>"y"' }));
    // Assert
    expect(page).not.toContain('<script>"y"');
    expect(page).toContain("x&lt;script&gt;&quot;y&quot;");
  });
});

describe("indexPage", () => {
  it("when rendering the index, uses the bare site title, website og:type and the static og:image", () => {
    // Act
    const page = indexPage(site, [post()]);
    // Assert
    expect(page).toContain("<title>#a5ebec</title>");
    expect(page).toContain('<meta property="og:type" content="website" />');
    expect(page).toContain(
      '<meta property="og:image" content="https://blog.h3y6e.com/assets/2f2f2f.jpg" />',
    );
    expect(page).toContain('<link rel="stylesheet" href="/css/a5ebec.css" />');
  });
});

describe("listPage", () => {
  it("when rendering a list page, og:description carries the plain site description without the title suffix", () => {
    // Act
    const page = listPage(site, "Tag: #kmnac", "/tags/kmnac/", [post()]);
    // Assert
    expect(page).toContain(
      `<meta name="description" content="${site.description} :: ${site.title}" />`,
    );
    expect(page).toContain(`<meta property="og:description" content="${site.description}" />`);
  });

  it("when rendering a list page, the title and og:url follow the given path", () => {
    // Act
    const page = listPage(site, "2020/12", "/posts/2020/12/", [post()]);
    // Assert
    expect(page).toContain("<title>2020/12</title>");
    expect(page).toContain(
      '<meta property="og:url" content="https://blog.h3y6e.com/posts/2020/12/" />',
    );
  });
});

describe("tagTable", () => {
  it("when tags have different counts, groups rows by count descending with names alphabetical within a row", () => {
    // Arrange
    const posts = [post({ tags: ["b", "a"] }), post({ slug: "p2", tags: ["a"] })];
    // Act
    const out = norm(tagTable(site, posts).html);
    // Assert
    expect(out).toBe(
      '<table class="tagpage"> <tr><th>count</th><th>name</th></tr> ' +
        '<tr><td class="count">2</td> <td class="block"> <a href="/tags/a/">#a</a> </td></tr> ' +
        '<tr><td class="count">1</td> <td class="block"> <a href="/tags/b/">#b</a> </td></tr></table>',
    );
  });
});

describe("typeTable", () => {
  it("when rendering the types landing page, lists every configured type in order with its count and meaning", () => {
    // Arrange
    const posts = [post({ type: "Report" }), post({ slug: "p2", type: "Report" })];
    // Act
    const out = norm(typeTable(site, posts).html);
    // Assert
    expect(out).toBe(
      '<table class="typepage"> <tr> <th>count</th> <th>name</th> <th>meaning</th> </tr> ' +
        '<tr> <td class="count">2</td> <td><a href="/types/report/">Report</a></td> <td>r</td> </tr>' +
        '<tr> <td class="count">0</td> <td><a href="/types/essay/">Essay</a></td> <td>e</td> </tr> ' +
        "</table>",
    );
  });
});

describe("tagsIndexPage", () => {
  it("when rendering the tags landing page, og:url and canonical use the trailing-slash public URL", () => {
    // Act
    const page = tagsIndexPage(site, [post()]);
    // Assert
    expect(page).toContain('<meta property="og:url" content="https://blog.h3y6e.com/tags/" />');
    expect(page).toContain('<link rel="canonical" href="https://blog.h3y6e.com/tags/" />');
  });
});

describe("notFoundPage", () => {
  it("when rendered, contains the 404 message and a link home", () => {
    // Act
    const page = notFoundPage(site);
    // Assert
    expect(page).toContain("404: File not found");
    expect(page).toContain('<a href="/">click here</a>');
  });
});

describe("html tag re-export sanity", () => {
  it("when templates interpolate user text, the html helper escapes it end to end", () => {
    // Act & Assert
    expect(html`<i>${"<x>"}</i>`.html).toBe("<i>&lt;x&gt;</i>");
  });
});
