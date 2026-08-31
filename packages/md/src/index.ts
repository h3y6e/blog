// Zero-dependency Markdown → HTML renderer covering the constructs used by
// the blog corpus. Output conventions follow marked (gfm) where they overlap;
// deviations: heading ids on h2/h3, GFM-style footnotes, math delegation.

export type Options = {
  /** Renders $...$ / $$...$$ TeX. When absent, math text is left verbatim. */
  math?: (tex: string, display: boolean) => string;
  /** Returns HTML for fenced code. When absent, content is escaped verbatim. */
  highlight?: (code: string, lang: string) => string;
};

type Ctx = {
  math?: Options["math"];
  highlight?: Options["highlight"];
  notes: Map<string, string>; // footnote label -> definition markdown
  used: string[]; // footnote labels in first-reference order
  slugs: Set<string>; // ids already emitted, for uniqueness
};

const escapeText = (s: string): string =>
  s
    .replace(/&(?!(?:#\d+|#[xX][0-9a-fA-F]+|\w+);)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeAll = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const cleanUrl = (href: string): string => {
  try {
    return encodeURI(href).replace(/%25/g, "%");
  } catch {
    return href;
  }
};

// Resolves backslash-escaped punctuation (the same set parseInline's own
// escape branch handles) in strings sliced raw out of link syntax and never
// re-parsed inline, e.g. a link destination or an image's alt text.
const unescape = (s: string): string => s.replace(/\\([!-/:-@[-`{-~])/g, "$1");

// CommonMark type-6 HTML block tag names (subset relevant to the corpus).
const BLOCK_TAGS =
  /^<\/?(?:address|article|aside|audio|blockquote|body|center|details|dialog|div|dl|dt|dd|fieldset|figcaption|figure|footer|form|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|nav|ol|p|script|section|source|style|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul|video)(?:[\s/>]|$)/i;

const FENCE = /^(`{3,})(.*)$/;
const HEADING = /^ {0,3}(#{1,6}) +(.*?)\s*#*\s*$/;
const HR = /^ {0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const LIST_ITEM = /^(\s*)([-*+]|\d+\.)( +)(.*)$/;
const TABLE_DELIM = /^ *\|? *:?-+:? *(?:\| *:?-+:? *)*\|? *$/;

// Non-null assertions on capture groups below are backed by the pattern:
// every asserted group participates in any successful match.

export function render(markdown: string, options: Options = {}): string {
  const ctx: Ctx = {
    math: options.math,
    highlight: options.highlight,
    notes: new Map(),
    used: [],
    slugs: new Set(),
  };
  const lines: string[] = [];
  let inFence: string | null = null;
  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const fence = FENCE.exec(line);
    if (fence) inFence = inFence === null ? fence[1]! : null;
    const def = inFence === null && /^\[\^([^\]]+)\]: ?(.*)$/.exec(line);
    if (def) ctx.notes.set(def[1]!, def[2]!);
    else lines.push(line);
  }
  return parseBlocks(lines, ctx) + footnoteSection(ctx);
}

function parseBlocks(lines: string[], ctx: Ctx): string {
  const out: string[] = [];
  let i = 0;
  let line: string | undefined;
  while ((line = lines[i]) !== undefined) {
    if (!line.trim()) {
      i++;
      continue;
    }
    let m = FENCE.exec(line);
    if (m) {
      const fence = m[1]!;
      const lang = m[2]!.trim();
      const code: string[] = [];
      i++;
      for (let l: string | undefined; (l = lines[i]) !== undefined && !l.startsWith(fence); i++)
        code.push(l);
      i++;
      const cls = lang ? ` class="language-${escapeAll(lang)}"` : "";
      const body = ctx.highlight?.(code.join("\n"), lang) ?? escapeAll(code.join("\n"));
      out.push(`<pre><code${cls}>${body}\n</code></pre>\n`);
      continue;
    }
    if (line.startsWith("<!--")) {
      const raw: string[] = [];
      for (let l: string | undefined; (l = lines[i]) !== undefined;) {
        raw.push(l);
        i++;
        if (l.includes("-->")) break;
      }
      out.push(raw.join("\n"));
      continue;
    }
    if (BLOCK_TAGS.test(line)) {
      const raw: string[] = [];
      for (let l: string | undefined; (l = lines[i]) !== undefined && l.trim(); i++) raw.push(l);
      out.push(raw.join("\n"));
      continue;
    }
    m = HEADING.exec(line);
    if (m) {
      const depth = m[1]!.length;
      const text = m[2]!;
      const id = depth === 2 || depth === 3 ? ` id="${slug(text, ctx)}"` : "";
      out.push(`<h${depth}${id}>${parseInline(text, ctx)}</h${depth}>\n`);
      i++;
      continue;
    }
    if (HR.test(line)) {
      out.push("<hr>\n");
      i++;
      continue;
    }
    if (/^ {0,3}>/.test(line)) {
      const inner: string[] = [];
      for (let l: string | undefined; (l = lines[i]) !== undefined && /^ {0,3}>/.test(l); i++)
        inner.push(l.replace(/^ {0,3}> ?/, ""));
      out.push(`<blockquote>\n${parseBlocks(inner, ctx)}</blockquote>\n`);
      continue;
    }
    if (ctx.math && line.trim() === "$$") {
      const tex: string[] = [];
      i++;
      for (let l: string | undefined; (l = lines[i]) !== undefined && l.trim() !== "$$"; i++)
        tex.push(l);
      i++;
      out.push(ctx.math(tex.join("\n"), true) + "\n");
      continue;
    }
    const delim = lines[i + 1];
    if (
      line.includes("|") &&
      delim !== undefined &&
      TABLE_DELIM.test(delim) &&
      delim.includes("|")
    ) {
      const [html, next] = parseTable(line, delim, lines, i, ctx);
      out.push(html + "\n");
      i = next;
      continue;
    }
    const item = LIST_ITEM.exec(line);
    if (item) {
      const [html, next] = parseList(item, lines, i, ctx);
      out.push(html + "\n");
      i = next;
      continue;
    }
    const para: string[] = [line];
    i++;
    for (
      let l: string | undefined;
      (l = lines[i]) !== undefined && l.trim() && !isBlockStart(l, ctx);
      i++
    )
      para.push(l);
    out.push(`<p>${parseInline(para.join("\n"), ctx)}</p>\n`);
  }
  return out.join("");
}

function isBlockStart(line: string, ctx: Ctx): boolean {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    HR.test(line) ||
    /^ {0,3}>/.test(line) ||
    LIST_ITEM.test(line) ||
    line.startsWith("<!--") ||
    BLOCK_TAGS.test(line) ||
    (!!ctx.math && line.trim() === "$$")
  );
}

const splitRow = (row: string): string[] =>
  row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());

function parseTable(
  header: string,
  delim: string,
  lines: string[],
  fromLine: number,
  ctx: Ctx,
): [string, number] {
  let i = fromLine;
  const head = splitRow(header);
  const aligns = splitRow(delim).map((d) =>
    d.startsWith(":") && d.endsWith(":")
      ? "center"
      : d.endsWith(":")
        ? "right"
        : d.startsWith(":")
          ? "left"
          : "",
  );
  const attr = (k: number): string => (aligns[k] ? ` align="${aligns[k]}"` : "");
  const cells = (row: string[], tag: string): string =>
    head.map((_, k) => `<${tag}${attr(k)}>${parseInline(row[k] ?? "", ctx)}</${tag}>`).join("\n");
  i += 2;
  const rows: string[] = [];
  for (let l: string | undefined; (l = lines[i]) !== undefined && l.includes("|"); i++)
    rows.push(`<tr>\n${cells(splitRow(l), "td")}\n</tr>`);
  const body = rows.length ? `<tbody>${rows.join("\n")}\n</tbody>` : "";
  return [`<table>\n<thead>\n<tr>\n${cells(head, "th")}\n</tr>\n</thead>\n${body}</table>`, i];
}

function parseList(
  first: RegExpExecArray,
  lines: string[],
  fromLine: number,
  ctx: Ctx,
): [string, number] {
  let i = fromLine;
  const base = first[1]!.length;
  const ordered = /\d/.test(first[2]!);
  const start = ordered ? parseInt(first[2]!, 10) : 1;
  const items: string[][] = [];
  let cur: string[] | null = null;
  let contentIndent = 0;
  let loose = false;
  let pendingBlank = false;
  let line: string | undefined;
  while ((line = lines[i]) !== undefined) {
    if (!line.trim()) {
      pendingBlank = true;
      cur?.push("");
      i++;
      continue;
    }
    const m = LIST_ITEM.exec(line);
    const indent = line.search(/[^ ]|$/);
    if (m && (!cur || m[1]!.length < contentIndent) && m[1]!.length <= base + 3) {
      if (pendingBlank && items.length) loose = true;
      pendingBlank = false;
      cur = [m[4]!];
      contentIndent = m[1]!.length + m[2]!.length + m[3]!.length;
      items.push(cur);
      i++;
      continue;
    }
    if (cur && indent >= contentIndent) {
      if (pendingBlank && !LIST_ITEM.test(line)) loose = true;
      pendingBlank = false;
      cur.push(line.slice(contentIndent));
      i++;
      continue;
    }
    if (cur && !pendingBlank && !m && !isBlockStart(line, ctx)) {
      cur.push(line); // lazy paragraph continuation
      i++;
      continue;
    }
    if (cur && m && indent > base) {
      // under-indented nested list: treat as child of the current item
      pendingBlank = false;
      cur.push(line.slice(Math.min(indent, contentIndent)));
      i++;
      continue;
    }
    break;
  }
  const last = items.at(-1);
  if (last) {
    let tail: string | undefined;
    while ((tail = last.at(-1)) !== undefined && !tail.trim()) last.pop();
    if (tail !== undefined) last[last.length - 1] = tail.trimEnd();
  }
  const body = items
    .map((item) => {
      let html = parseBlocks(item, ctx).trimEnd();
      if (!loose) html = html.replace(/^<p>([\s\S]*?)<\/p>\n?/, "$1");
      return `<li>${html}</li>`;
    })
    .join("\n");
  const tag = ordered ? "ol" : "ul";
  const startAttr = ordered && start !== 1 ? ` start="${start}"` : "";
  return [`<${tag}${startAttr}>\n${body}\n</${tag}>`, i];
}

function slug(raw: string, ctx: Ctx): string {
  const base = raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~$]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s+/g, "-");
  // Suffix with the lowest -n not already emitted, so a heading whose own
  // text collides with another heading's suffixed id (e.g. "A" and "A 1"
  // both slugifying towards "a-1") still gets a unique id.
  let id = base;
  for (let n = 1; ctx.slugs.has(id); n++) id = `${base}-${n}`;
  ctx.slugs.add(id);
  return id;
}

const CODESPAN = /^(`+)([\s\S]*?[^`])\1(?!`)/;
const AUTOLINK = /^<(https?:\/\/[^\s<>]+)>/;
const HTML_INLINE = /^<!--[\s\S]*?-->|^<\/?[a-zA-Z][a-zA-Z0-9-]*(?:\s[^<>]*?)?\/?>/;
const BR = /^( {2,}|\\)\n(?!\s*$)/;
const MATH_INLINE = /^\$([^$\n]+?)\$/;
const FOOTNOTE_REF = /^\[\^([^\]]+)\]/;
const STRONG = /^(\*\*|__)(?=\S)([\s\S]*?\S)\1/;
const EM_STAR = /^\*(?=[^\s*])([^*]*[^\s*])\*/;
const EM_UNDERSCORE = /^_(?=[^\s_])([^_]*[^\s_])_(?![\p{L}\p{N}])/u;
const DEL = /^~~(?=\S)([\s\S]*?\S)~~/;
const ESCAPE = /^\\([!-/:-@[-`{-~])/;

function parseInline(src: string, ctx: Ctx): string {
  let out = "";
  let text = ""; // pending plain text, flushed with escaping
  const flush = (): void => {
    out += escapeText(text);
    text = "";
  };
  let i = 0;
  for (let ch = src[i]; ch !== undefined; ch = src[i]) {
    const rest = src.slice(i);
    const prev = src[i - 1] ?? "\n";
    let m: RegExpExecArray | null;
    if ((m = BR.exec(rest))) {
      flush();
      out += "<br>";
      i += m[0].length;
      continue;
    }
    if ((m = CODESPAN.exec(rest))) {
      flush();
      let code = m[2]!.replace(/\n/g, " ");
      if (/^ .*[^ ].* $/.test(code)) code = code.slice(1, -1);
      out += `<code>${escapeAll(code)}</code>`;
      i += m[0].length;
      continue;
    }
    if ((m = AUTOLINK.exec(rest))) {
      flush();
      const url = m[1]!;
      out += `<a href="${cleanUrl(url)}">${escapeText(url)}</a>`;
      i += m[0].length;
      continue;
    }
    if (rest[0] === "<" && (m = HTML_INLINE.exec(rest))) {
      flush();
      out += m[0];
      i += m[0].length;
      continue;
    }
    if ((m = FOOTNOTE_REF.exec(rest))) {
      flush();
      out += footnoteRef(m[1]!, ctx);
      i += m[0].length;
      continue;
    }
    if (rest[0] === "!" && rest[1] === "[") {
      const link = matchLink(rest.slice(1));
      if (link) {
        flush();
        const title = link.title ? ` title="${escapeText(link.title)}"` : "";
        out += `<img src="${cleanUrl(link.href)}" alt="${escapeText(unescape(link.text))}"${title}>`;
        i += 1 + link.length;
        continue;
      }
    }
    if (rest[0] === "[") {
      const link = matchLink(rest);
      if (link) {
        flush();
        const title = link.title ? ` title="${escapeText(link.title)}"` : "";
        out += `<a href="${cleanUrl(link.href)}"${title}>${parseInline(link.text, ctx)}</a>`;
        i += link.length;
        continue;
      }
    }
    if ((m = STRONG.exec(rest))) {
      flush();
      out += `<strong>${parseInline(m[2]!, ctx)}</strong>`;
      i += m[0].length;
      continue;
    }
    if ((m = EM_STAR.exec(rest))) {
      flush();
      out += `<em>${parseInline(m[1]!, ctx)}</em>`;
      i += m[0].length;
      continue;
    }
    if (!/[\p{L}\p{N}]/u.test(prev) && (m = EM_UNDERSCORE.exec(rest))) {
      flush();
      out += `<em>${parseInline(m[1]!, ctx)}</em>`;
      i += m[0].length;
      continue;
    }
    if ((m = DEL.exec(rest))) {
      flush();
      out += `<del>${parseInline(m[1]!, ctx)}</del>`;
      i += m[0].length;
      continue;
    }
    if (ctx.math && rest[0] === "$" && (m = MATH_INLINE.exec(rest))) {
      flush();
      out += ctx.math(m[1]!, false);
      i += m[0].length;
      continue;
    }
    if ((m = ESCAPE.exec(rest))) {
      text += m[1]!;
      i += 2;
      continue;
    }
    text += ch;
    i++;
  }
  flush();
  return out;
}

type Link = {
  text: string;
  href: string;
  title?: string;
  length: number;
};

// Matches [text](href "title") at the start of src, with nested brackets in
// text and balanced parentheses in href.
function matchLink(src: string): Link | null {
  let depth = 0;
  let i = 0;
  for (; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === "[") depth++;
    else if (src[i] === "]" && --depth === 0) break;
  }
  if (depth !== 0 || src[i + 1] !== "(") return null;
  const text = src.slice(1, i);
  let j = i + 2;
  let paren = 1;
  for (; j < src.length; j++) {
    if (src[j] === "\\") j++;
    else if (src[j] === "(") paren++;
    else if (src[j] === ")" && --paren === 0) break;
  }
  if (paren !== 0) return null;
  const dest = src.slice(i + 2, j).trim();
  const t = /^(\S*)\s+"([^"]*)"$/.exec(dest);
  const title = t?.[2];
  return {
    text,
    href: unescape(t ? t[1]! : dest),
    ...(title !== undefined && { title: unescape(title) }),
    length: j + 1,
  };
}

function footnoteRef(label: string, ctx: Ctx): string {
  let n = ctx.used.indexOf(label) + 1;
  const isFirst = n === 0;
  if (isFirst) n = ctx.used.push(label);
  const id = isFirst ? ` id="fnref-${n}"` : "";
  return `<sup class="footnote-ref"><a href="#fn-${n}"${id}>${n}</a></sup>`;
}

function footnoteSection(ctx: Ctx): string {
  if (!ctx.used.length) return "";
  const items = ctx.used.map((label, k) => {
    const n = k + 1;
    const note = ctx.notes.get(label);
    if (note === undefined) throw new Error(`footnote reference [^${label}] has no definition`);
    const def = parseInline(note, ctx);
    return `<li id="fn-${n}">${def} <a href="#fnref-${n}" class="footnote-backref">↩</a></li>`;
  });
  return `<section class="footnotes">\n<ol>\n${items.join("\n")}\n</ol>\n</section>\n`;
}
