import { describe, expect, it } from "vite-plus/test";
import { llmsFullTxt, llmsTxt, postMarkdown } from "./llms.ts";
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
    markdown: "body **one**",
  },
  {
    slug: "two",
    title: "Two",
    date: "2026-01-02",
    tags: ["a"],
    rssDescription: "d2",
    html: "<p>2</p>",
    markdown: "body two",
  },
];

describe("postMarkdown", () => {
  it("when given a post, prefixes the source body with title and metadata", () => {
    // Act
    const md = postMarkdown(site, posts[0]!);
    // Assert
    expect(md).toBe(
      "# One\n\n" +
        "- date: 2026-01-01\n" +
        "- tags: a, b\n" +
        "- url: https://blog.h3y6e.com/posts/one/\n\n" +
        "body **one**\n",
    );
  });
});

describe("llmsTxt", () => {
  it("when given posts, builds an llms.txt index linking the markdown mirrors, newest first", () => {
    // Act
    const txt = llmsTxt(site, posts);
    // Assert
    expect(txt).toBe(
      "# #a5ebec\n\n" +
        "> へいほぅの殴り書き\n\n" +
        "## Posts\n\n" +
        "- [Two](https://blog.h3y6e.com/posts/two/index.md): d2\n" +
        "- [One](https://blog.h3y6e.com/posts/one/index.md): d1\n",
    );
  });
});

describe("llmsFullTxt", () => {
  it("when given posts, concatenates every post's markdown newest first with separators", () => {
    // Act
    const txt = llmsFullTxt(site, posts);
    // Assert
    expect(txt).toBe(`${postMarkdown(site, posts[1]!)}\n---\n\n${postMarkdown(site, posts[0]!)}`);
  });
});
