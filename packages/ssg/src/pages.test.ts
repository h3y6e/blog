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
};

const posts: Post[] = [
  {
    slug: "one",
    title: "One",
    date: "2026-01-01",
    tags: ["a", "b"],
    rssDescription: "d1",
    html: "<p>1</p>",
  },
  {
    slug: "two",
    title: "Two",
    date: "2026-01-02",
    tags: ["a"],
    rssDescription: "d2",
    html: "<p>2</p>",
  },
];

describe("buildPages", () => {
  it("when given posts, produces index, 404, feed, tags landing, per-post and per-tag pages", () => {
    // Act
    const pages = buildPages(site, posts);
    // Assert
    expect([...pages.keys()].toSorted()).toEqual([
      "404.html",
      "feed.xml",
      "index.html",
      "posts/one/index.html",
      "posts/two/index.html",
      "tags/a/index.html",
      "tags/b/index.html",
      "tags/index.html",
    ]);
  });

  it("when a tag page is generated, it lists only posts carrying that tag", () => {
    // Act
    const pages = buildPages(site, posts);
    // Assert
    const tagB = pages.get("tags/b/index.html")!;
    expect(tagB).toContain("/posts/one/");
    expect(tagB).not.toContain("/posts/two/");
  });

  it("when the feed is generated, each item carries the canonical index.html GUID", () => {
    // Act
    const feed = buildPages(site, posts).get("feed.xml")!;
    // Assert
    expect(feed).toContain("<guid> https://blog.h3y6e.com/posts/one/index.html </guid>");
    expect(feed).toContain("<guid> https://blog.h3y6e.com/posts/two/index.html </guid>");
  });
});
