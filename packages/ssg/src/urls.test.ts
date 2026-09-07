import { describe, expect, it } from "vite-plus/test";
import type { SiteConfig } from "./types.ts";
import {
  byDateDesc,
  byDateDescFeed,
  pageFile,
  postFullUrl,
  postPath,
  tagFullUrl,
  tagPath,
  tagsIndexFullUrl,
  tagsIndexPath,
} from "./urls.ts";

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

describe("postPath / postFullUrl / tagPath", () => {
  it("when given a slug, builds the trailing-slash page path and the index.html canonical URL", () => {
    // Act & Assert
    expect(postPath("a2net")).toBe("/posts/a2net/");
    expect(postFullUrl(site, "a2net")).toBe("https://blog.h3y6e.com/posts/a2net/index.html");
    expect(tagPath(site, "kmnac")).toBe("/tags/kmnac/");
  });
});

describe("tagFullUrl / tagsIndexPath / tagsIndexFullUrl", () => {
  it("when given a tag, builds the same index.html canonical URL shape as postFullUrl", () => {
    // Act & Assert
    expect(tagFullUrl(site, "kmnac")).toBe("https://blog.h3y6e.com/tags/kmnac/index.html");
  });

  it("when given the site config, builds the tags landing page path and canonical URL", () => {
    // Act & Assert
    expect(tagsIndexPath(site)).toBe("/tags/");
    expect(tagsIndexFullUrl(site)).toBe("https://blog.h3y6e.com/tags/index.html");
  });
});

describe("pageFile", () => {
  it("when given a trailing-slash URL path, strips the leading slash and appends index.html", () => {
    // Act & Assert
    expect(pageFile("/posts/a2net/")).toBe("posts/a2net/index.html");
    expect(pageFile("/tags/")).toBe("tags/index.html");
  });
});

describe("sort orders", () => {
  // Arrange
  const posts = [
    { slug: "calver", date: "2026-03-25" },
    { slug: "meta-repo", date: "2026-03-25" },
    { slug: "newest", date: "2026-04-27" },
  ];

  it("when dates tie, the listing order breaks ties by slug ascending", () => {
    // Act
    const sorted = byDateDesc(posts);
    // Assert
    expect(sorted.map((p) => p.slug)).toEqual(["newest", "calver", "meta-repo"]);
  });

  it("when dates tie, the feed order breaks ties by slug descending", () => {
    // Act
    const sorted = byDateDescFeed(posts);
    // Assert
    expect(sorted.map((p) => p.slug)).toEqual(["newest", "meta-repo", "calver"]);
  });
});
