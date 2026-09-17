import type { AnyTxtNode, TxtDocumentNode } from "@textlint/ast-node-types";

// Stands in for inline code. Chosen so the morphological analyser reads it as a noun.
const PLACEHOLDER = "識別子";

const SENTENCE_ENDERS = "。！？!?";
const CLOSERS = "」』）)】";

export type Segment = {
  text: string;
  /** Ranges of `text` to drop from character counts: the inline-code placeholders. */
  masked: [number, number][];
  /** Absolute offset of the source node, used to place reports. */
  offset: number;
};

export type Sentence = { text: string; segment: number; offset: number };

// AnyTxtNode is a union, so narrow before reaching for children or value.
const childrenOf = (node: AnyTxtNode): readonly AnyTxtNode[] =>
  "children" in node ? node.children : [];
const valueOf = (node: AnyTxtNode): string =>
  "value" in node && typeof node.value === "string" ? node.value : "";

const isUrlOnly = (node: AnyTxtNode): boolean => {
  const children = childrenOf(node).filter(
    (child) => child.type !== "Str" || valueOf(child).trim() !== "",
  );
  const only = children[0];
  return (
    children.length === 1 && only !== undefined && (only.type === "Link" || only.type === "Image")
  );
};

const DROPPED = new Set(["Image", "Html", "Comment"]);

// Markup, not prose: the SSG expands these into HTML (packages/ssg/src/shortcodes.ts).
const SHORTCODE_LINE = /^(?:\{\{ \S+ .*\}\}|\\figure\{[^}]*\}\{[^}]*\})$/gm;

/** Blanked rather than cut, so offsets still point at the source. */
const dropShortcodes = (text: string): string =>
  text.replace(SHORTCODE_LINE, (line) => " ".repeat(line.length));

const toSegment = (node: AnyTxtNode): Segment | null => {
  if (isUrlOnly(node)) return null;
  let text = "";
  const masked: [number, number][] = [];
  const walk = (current: AnyTxtNode): void => {
    if (current.type === "Code") {
      masked.push([text.length, text.length + PLACEHOLDER.length]);
      text += PLACEHOLDER;
      return;
    }
    if (DROPPED.has(current.type)) return;
    if ("children" in current) {
      for (const child of current.children) walk(child);
      return;
    }
    text += valueOf(current);
  };
  walk(node);
  text = dropShortcodes(text);
  if (text.trim() === "") return null;
  return { text, masked, offset: node.range[0] };
};

/**
 * Prose paragraphs, list items included and their markers dropped.
 *
 * Headings, code blocks, tables, standalone links and images are not prose.
 * Calibration and rule evaluation both go through here so that thresholds and
 * measurements see the same text.
 */
export const proseSegments = (root: TxtDocumentNode): Segment[] => {
  const segments: Segment[] = [];
  const walk = (node: AnyTxtNode): void => {
    if (node.type === "Paragraph") {
      const segment = toSegment(node);
      if (segment) segments.push(segment);
      return;
    }
    if (node.type === "CodeBlock" || node.type === "Header" || node.type === "Table") return;
    for (const child of childrenOf(node)) walk(child);
  };
  walk(root);
  return segments;
};

/** Splits on 。！？!? and on newlines, keeping trailing closing brackets. */
export const splitSentences = (segment: Segment, index: number): Sentence[] => {
  const { text } = segment;
  const sentences: Sentence[] = [];
  const emit = (from: number, to: number): void => {
    let end = to;
    while (end > from && /\s/.test(text[end - 1] ?? "")) end -= 1;
    if (end > from) {
      sentences.push({
        text: text.slice(from, end),
        segment: index,
        offset: segment.offset + from,
      });
    }
  };
  let start: number | null = null;
  let i = 0;
  while (i < text.length) {
    const ch = text[i] ?? "";
    if (start === null) {
      if (!/\s/.test(ch)) start = i;
      i += 1;
      continue;
    }
    if (ch === "\n") {
      emit(start, i);
      start = null;
      i += 1;
      continue;
    }
    if (SENTENCE_ENDERS.includes(ch)) {
      let j = i + 1;
      while (j < text.length && SENTENCE_ENDERS.includes(text[j] ?? "")) j += 1;
      while (j < text.length && CLOSERS.includes(text[j] ?? "")) j += 1;
      emit(start, j);
      start = null;
      i = j;
      continue;
    }
    i += 1;
  }
  if (start !== null) emit(start, text.length);
  return sentences;
};

export const allSentences = (segments: Segment[]): Sentence[] =>
  segments.flatMap((segment, index) => splitSentences(segment, index));

/** Prose characters with placeholders and whitespace removed. */
export const proseChars = (segments: Segment[]): string[] => {
  const chars: string[] = [];
  for (const segment of segments) {
    for (let i = 0; i < segment.text.length; i += 1) {
      const ch = segment.text[i] ?? "";
      if (/\s/.test(ch)) continue;
      if (segment.masked.some(([from, to]) => i >= from && i < to)) continue;
      chars.push(ch);
    }
  }
  return chars;
};
