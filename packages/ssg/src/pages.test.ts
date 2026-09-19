import { describe, expect, it } from "vite-plus/test";
import { buildPages } from "./pages.ts";
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

const posts: Post[] = [
  {
    slug: "one",
    title: "One",
    date: "2026-01-01",
    type: "Report",
    tags: ["a", "b"],
    rssDescription: "d1",
    aliases: ["/posts/one/"],
    html: "<p>1</p>",
    markdown: "md",
  },
  {
    slug: "two",
    title: "Two",
    date: "2026-01-02",
    type: "Essay",
    tags: ["a"],
    rssDescription: "d2",
    html: "<p>2</p>",
    markdown: "md",
  },
];

describe("buildPages", () => {
  it("when given posts, produces index, 404, feed, tags and types landings, per-post, per-tag and per-type pages", () => {
    // Act
    const pages = buildPages(site, posts);
    // Assert
    expect([...pages.keys()].toSorted()).toEqual([
      "404.html",
      "feed.xml",
      "index.html",
      "llms-full.txt",
      "llms.txt",
      "posts.json",
      "posts/2026/01/01/index.html",
      "posts/2026/01/01/one/index.html",
      "posts/2026/01/01/one/index.md",
      "posts/2026/01/02/index.html",
      "posts/2026/01/02/two/index.html",
      "posts/2026/01/02/two/index.md",
      "posts/2026/01/index.html",
      "posts/2026/index.html",
      "posts/index.html",
      "posts/one/index.html",
      "tags/a/index.html",
      "tags/b/index.html",
      "tags/index.html",
      "types/essay/index.html",
      "types/index.html",
      "types/report/index.html",
    ]);
  });

  it("when a type page is generated, it lists only posts of that type", () => {
    // Act
    const pages = buildPages(site, posts);
    // Assert
    const report = pages.get("types/report/index.html")!;
    expect(report).toContain("/posts/2026/01/01/one/");
    expect(report).not.toContain("/posts/2026/01/02/two/");
  });

  it("when the posts index is generated, it lists metadata newest first for the WebMCP tool", () => {
    // Act
    const index = JSON.parse(buildPages(site, posts).get("posts.json")!);
    // Assert
    expect(index).toEqual([
      {
        slug: "two",
        title: "Two",
        date: "2026-01-02",
        type: "Essay",
        tags: ["a"],
        description: "d2",
        url: "https://blog.h3y6e.com/posts/2026/01/02/two/",
      },
      {
        slug: "one",
        title: "One",
        date: "2026-01-01",
        type: "Report",
        tags: ["a", "b"],
        description: "d1",
        url: "https://blog.h3y6e.com/posts/2026/01/01/one/",
      },
    ]);
  });

  it("when a tag page is generated, it lists only posts carrying that tag", () => {
    // Act
    const pages = buildPages(site, posts);
    // Assert
    const tagB = pages.get("tags/b/index.html")!;
    expect(tagB).toContain("/posts/2026/01/01/one/");
    expect(tagB).not.toContain("/posts/2026/01/02/two/");
  });

  it("when the feed is generated, each item carries the canonical index.html GUID", () => {
    // Act
    const feed = buildPages(site, posts).get("feed.xml")!;
    // Assert
    expect(feed).toContain("<guid> https://blog.h3y6e.com/posts/2026/01/01/one/index.html </guid>");
    expect(feed).toContain("<guid> https://blog.h3y6e.com/posts/2026/01/02/two/index.html </guid>");
  });

  it("when posts share a month, the month archive lists them and the day archive lists only its own", () => {
    // Act
    const pages = buildPages(site, posts);
    // Assert
    const month = pages.get("posts/2026/01/index.html")!;
    expect(month).toContain("/posts/2026/01/01/one/");
    expect(month).toContain("/posts/2026/01/02/two/");
    const day = pages.get("posts/2026/01/01/index.html")!;
    expect(day).toContain("/posts/2026/01/01/one/");
    expect(day).not.toContain("/posts/2026/01/02/two/");
  });

  it("when a post declares an alias, that path gets a page redirecting to the current URL", () => {
    // Act
    const page = buildPages(site, posts).get("posts/one/index.html")!;
    // Assert
    expect(page).toContain('<link rel="canonical" href="/posts/2026/01/01/one/" />');
    expect(page).toContain('<meta http-equiv="refresh" content="0; url=/posts/2026/01/01/one/" />');
    expect(page).toContain('<a href="/posts/2026/01/01/one/">');
  });
});
