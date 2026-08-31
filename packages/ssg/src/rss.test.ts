import { describe, expect, it } from "vite-plus/test";
import { franklinEscape, renderFeed, renderItem, rfc1123 } from "./rss.ts";
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

const post = (over: Partial<Post>): Post => ({
  slug: "a2net",
  title: "A2ネットを改善しよう",
  date: "2020-12-18",
  tags: [],
  rssDescription: "寮のネットワークを改善している話。",
  html: "",
  ...over,
});

describe("franklinEscape", () => {
  it("when text contains Franklin-special characters, emits the same entities as the live feed", () => {
    // Act & Assert
    expect(franklinEscape("[論文読み] (a+b) & c")).toBe(
      "&#91;論文読み&#93; &#40;a&#43;b&#41; &amp; c",
    );
  });

  it("when text contains paired underscores, converts each pair to em tags like Franklin's markdown pass", () => {
    // Act & Assert
    expect(franklinEscape("csc_pref_camera_forced_shuttersound_key")).toBe(
      "csc<em>pref</em>camera<em>forced</em>shuttersound_key",
    );
  });
});

describe("rfc1123", () => {
  it("when given an ISO date, formats UTC midnight with zero-padded day and +0000", () => {
    // Act & Assert
    expect(rfc1123("2019-05-17")).toBe("Fri, 17 May 2019 00:00:00 +0000");
    expect(rfc1123("2026-04-27")).toBe("Mon, 27 Apr 2026 00:00:00 +0000");
  });
});

describe("renderItem", () => {
  it("when rendering a post, reproduces the live feed item bytes including trailing whitespace", () => {
    // Arrange
    const p = post({
      slug: "20260427-gh-aw-project-triage",
      title: "gh-awでProjectの手入れをGitHub Actionsに乗せる",
      date: "2026-04-27",
      rssDescription: "Markdown workflowでProjectの空欄を安全に埋める",
    });
    // Act
    const item = renderItem(site, p);
    // Assert — copied verbatim from https://blog.h3y6e.com/feed.xml
    expect(item).toBe(
      "<item>\n" +
        "  <title>\n" +
        "    <![CDATA[  gh-awでProjectの手入れをGitHub Actionsに乗せる  ]]>\n" +
        "  </title>\n" +
        "  <link> https://blog.h3y6e.com/posts/20260427-gh-aw-project-triage/index.html </link>\n" +
        "  <guid> https://blog.h3y6e.com/posts/20260427-gh-aw-project-triage/index.html </guid>\n" +
        "  <description>\n" +
        "    <![CDATA[  Markdown workflowでProjectの空欄を安全に埋める  ]]>\n" +
        "  </description>  \n" +
        "    \n" +
        "  <pubDate>Mon, 27 Apr 2026 00:00:00 +0000</pubDate>  \n" +
        "  \n" +
        "  \n" +
        "  <atom:author>\n" +
        "    <atom:name>heyhoe</atom:name>\n" +
        "  </atom:author>\n" +
        "        \n" +
        "</item>\n",
    );
  });
});

describe("renderFeed", () => {
  it("when rendering the feed, wraps items in the exact live channel envelope without a trailing newline", () => {
    // Arrange
    const posts = [post({})];
    // Act
    const feed = renderFeed(site, posts);
    // Assert
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n\n<rss version="2.0"\n')).toBe(
      true,
    );
    expect(feed).toContain(
      "  <channel>\n" +
        "    <title>\n" +
        "      <![CDATA[  #a5ebec  ]]>\n" +
        "    </title>\n" +
        "    <link> https://blog.h3y6e.com </link>\n" +
        "    <description>\n" +
        "      <![CDATA[  へいほぅの殴り書き  ]]>\n" +
        "    </description>\n" +
        "    <atom:link\n" +
        '      href="https://blog.h3y6e.com/feed.xml"\n' +
        '      rel="self"\n' +
        '      type="application/rss+xml" />\n' +
        "\n\n<item>",
    );
    expect(feed.endsWith("</item>\n</channel></rss>")).toBe(true);
  });

  it("when two posts share a date, orders the feed by date descending then slug descending", () => {
    // Arrange
    const posts = [
      post({ slug: "20260325-calver-with-tagpr", date: "2026-03-25" }),
      post({ slug: "20260325-meta-repo-for-non-coders", date: "2026-03-25" }),
    ];
    // Act
    const feed = renderFeed(site, posts);
    // Assert
    expect(feed.indexOf("meta-repo")).toBeLessThan(feed.indexOf("calver"));
  });
});
