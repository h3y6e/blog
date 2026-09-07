import { describe, expect, it } from "vite-plus/test";
import { parseFrontmatter } from "./frontmatter.ts";

const fm = (block: string, body = "hello\n"): string => `---\n${block}\n---\n${body}`;

describe("parseFrontmatter", () => {
  it("when given quoted strings, an ISO date and an inline tag list, returns every field and the body", () => {
    // Arrange
    const source = fm(
      [
        'title: "A2ネットを改善しよう"',
        "date: 2020-12-18",
        'tags: ["kmnac", "adventcalendar"]',
        'rss_description: "寮のネットワークを改善している話。"',
        'cover: "/img/2020-12-18/rack.jpg"',
      ].join("\n"),
    );
    // Act
    const { frontmatter, body } = parseFrontmatter(source);
    // Assert
    expect(frontmatter).toEqual({
      title: "A2ネットを改善しよう",
      date: "2020-12-18",
      tags: ["kmnac", "adventcalendar"],
      rss_description: "寮のネットワークを改善している話。",
      cover: "/img/2020-12-18/rack.jpg",
    });
    expect(body).toBe("hello\n");
  });

  it("when tags are written as a dash list, parses them in order", () => {
    // Arrange
    const source = fm(
      ['title: "t"', "date: 2026-01-01", "tags:", "  - a", '  - "b"', 'rss_description: "d"'].join(
        "\n",
      ),
    );
    // Act
    const { frontmatter } = parseFrontmatter(source);
    // Assert
    expect(frontmatter.tags).toEqual(["a", "b"]);
  });

  it("when a scalar is unquoted, returns it verbatim", () => {
    // Arrange
    const source = fm(
      ["title: plain title", "date: 2026-01-01", "tags: []", "rss_description: desc"].join("\n"),
    );
    // Act
    const { frontmatter } = parseFrontmatter(source);
    // Assert
    expect(frontmatter.title).toBe("plain title");
    expect(frontmatter.tags).toEqual([]);
    expect(frontmatter.cover).toBeUndefined();
  });

  it("when a quoted value contains a colon or brackets, keeps them as content", () => {
    // Arrange
    const source = fm(
      [
        'title: "[論文読み] How: Do? "',
        "date: 2019-10-24",
        'tags: ["paper"]',
        'rss_description: "x"',
      ].join("\n"),
    );
    // Act
    const { frontmatter } = parseFrontmatter(source);
    // Assert
    expect(frontmatter.title).toBe("[論文読み] How: Do? ");
  });

  it("when the frontmatter block is missing, throws", () => {
    // Act & Assert
    expect(() => parseFrontmatter("no frontmatter")).toThrow(/missing --- block/);
  });

  it("when a required key is missing, throws naming the key", () => {
    // Arrange
    const source = fm(['title: "t"', "date: 2026-01-01", "tags: []"].join("\n"));
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/missing key: rss_description/);
  });

  it("when an unknown key appears, throws", () => {
    // Arrange
    const source = fm(
      ['title: "t"', "date: 2026-01-01", "tags: []", 'rss_description: "d"', "draft: true"].join(
        "\n",
      ),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/unknown key: draft/);
  });

  it("when the date is not YYYY-MM-DD, throws", () => {
    // Arrange
    const source = fm(
      ['title: "t"', "date: 2026/01/01", "tags: []", 'rss_description: "d"'].join("\n"),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/date must be YYYY-MM-DD/);
  });

  it("when tags is a bare scalar, throws", () => {
    // Arrange
    const source = fm(
      ['title: "t"', "date: 2026-01-01", "tags: a, b", 'rss_description: "d"'].join("\n"),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/tags must be a list/);
  });

  it("when a tag contains a comma, keeps it as one item instead of splitting on the quoted comma", () => {
    // Arrange
    const source = fm(
      ['title: "t"', "date: 2026-01-01", 'tags: ["a, b", "c"]', 'rss_description: "d"'].join("\n"),
    );
    // Act
    const { frontmatter } = parseFrontmatter(source);
    // Assert
    expect(frontmatter.tags).toEqual(["a, b", "c"]);
  });

  it("when a key is repeated, throws naming the key even for names shared with Object.prototype", () => {
    // Arrange
    const source = fm(
      ['title: "t"', "date: 2026-01-01", "tags: []", 'rss_description: "d"', "title: dup"].join(
        "\n",
      ),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/duplicate key: title/);
  });

  it("when a frontmatter key names an inherited Object.prototype property, throws unknown key instead of a misleading duplicate-key error", () => {
    // Arrange
    const source = fm(
      [
        'title: "t"',
        "date: 2026-01-01",
        "tags: []",
        'rss_description: "d"',
        "constructor: foo",
      ].join("\n"),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/unknown key: constructor/);
  });

  it("when cover has no leading slash, throws", () => {
    // Arrange
    const source = fm(
      [
        'title: "t"',
        "date: 2026-01-01",
        "tags: []",
        'rss_description: "d"',
        'cover: "img/foo.jpg"',
      ].join("\n"),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/cover must be a root-relative path/);
  });

  it("when cover is already an absolute URL, throws", () => {
    // Arrange
    const source = fm(
      [
        'title: "t"',
        "date: 2026-01-01",
        "tags: []",
        'rss_description: "d"',
        'cover: "https://cdn.example.com/foo.jpg"',
      ].join("\n"),
    );
    // Act & Assert
    expect(() => parseFrontmatter(source)).toThrow(/cover must be a root-relative path/);
  });
});
