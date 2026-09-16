import type {
  TxtCodeBlockNode,
  TxtCodeNode,
  TxtDocumentNode,
  TxtHeaderNode,
  TxtLinkNode,
  TxtListItemNode,
  TxtListNode,
  TxtParagraphNode,
  TxtStrNode,
} from "@textlint/ast-node-types";
import { describe, expect, it } from "vite-plus/test";
import { allSentences, proseChars, proseSegments } from "./prose.ts";

// Hand-built nodes: markdown-to-ast cannot be a direct dependency, see calibrate.ts.
const LOC = { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } };
type Base = Omit<TxtStrNode, "type" | "value">;
const base = (raw: string, start = 0): Base => ({
  raw,
  range: [start, start + raw.length],
  loc: LOC,
});

type Inline = TxtStrNode | TxtCodeNode | TxtLinkNode;
type Block = TxtParagraphNode | TxtHeaderNode | TxtCodeBlockNode | TxtListNode;

const str = (value: string): TxtStrNode => ({ type: "Str", value, ...base(value) });
const code = (value: string): TxtCodeNode => ({ type: "Code", value, ...base(value) });
const codeBlock = (value: string): TxtCodeBlockNode => ({
  type: "CodeBlock",
  value,
  lang: null,
  ...base(value),
});
const link = (children: TxtStrNode[]): TxtLinkNode => ({
  type: "Link",
  url: "https://example.com",
  children,
  ...base(""),
});
const header = (children: TxtStrNode[]): TxtHeaderNode => ({
  type: "Header",
  depth: 2,
  children,
  ...base(""),
});
const paragraph = (children: Inline[], start = 0): TxtParagraphNode => ({
  type: "Paragraph",
  children,
  ...base("", start),
});
const listItem = (children: TxtParagraphNode[]): TxtListItemNode => ({
  type: "ListItem",
  checked: null,
  spread: false,
  children,
  ...base(""),
});
const list = (children: TxtListItemNode[]): TxtListNode => ({
  type: "List",
  ordered: false,
  start: null,
  spread: false,
  children,
  ...base(""),
});
const document = (children: Block[]): TxtDocumentNode => ({
  type: "Document",
  children,
  ...base(""),
});

describe("proseSegments", () => {
  it("when given a heading and a code block, leaves both out of the prose", () => {
    // Arrange
    const tree = document([
      header([str("環境")]),
      codeBlock("npm install"),
      paragraph([str("Ubuntu 18.04 を使う。")]),
    ]);

    // Act
    const segments = proseSegments(tree);

    // Assert
    expect(segments.map((segment) => segment.text)).toEqual(["Ubuntu 18.04 を使う。"]);
  });

  it("when given a list item, keeps its text as a paragraph without the marker", () => {
    // Arrange
    const tree = document([list([listItem([paragraph([str("タブ機能あり")])])])]);

    // Act
    const segments = proseSegments(tree);

    // Assert
    expect(segments.map((segment) => segment.text)).toEqual(["タブ機能あり"]);
  });

  it("when a paragraph holds only a link, drops it as a standalone URL line", () => {
    // Arrange
    const tree = document([paragraph([link([str("https://example.com")])])]);

    // Act
    const segments = proseSegments(tree);

    // Assert
    expect(segments).toEqual([]);
  });

  it("when a paragraph holds inline code, replaces it with a placeholder and excludes it from the character count", () => {
    // Arrange
    const tree = document([paragraph([str("設定は "), code("font_size"), str(" で変える。")])]);

    // Act
    const segments = proseSegments(tree);
    const chars = proseChars(segments);

    // Assert
    expect(segments[0]?.text).toBe("設定は 識別子 で変える。");
    expect(chars.join("")).toBe("設定はで変える。");
  });
});

describe("allSentences", () => {
  it("when a paragraph mixes periods and newlines, splits on both", () => {
    // Arrange
    const tree = document([paragraph([str("短い文を書く。\n改行でも切れる")])]);

    // Act
    const sentences = allSentences(proseSegments(tree));

    // Assert
    expect(sentences.map((sentence) => sentence.text)).toEqual([
      "短い文を書く。",
      "改行でも切れる",
    ]);
  });

  it("when a sentence ends on a closing bracket, keeps the bracket in the same sentence", () => {
    // Arrange
    const tree = document([paragraph([str("そう思った（たぶん。）次に進む")])]);

    // Act
    const sentences = allSentences(proseSegments(tree));

    // Assert
    expect(sentences.map((sentence) => sentence.text)).toEqual([
      "そう思った（たぶん。）",
      "次に進む",
    ]);
  });
});
