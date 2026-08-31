import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { highlight, withLineNumbers } from "../src/index.ts";

const postsDir = fileURLToPath(new URL("../../../site/posts", import.meta.url));

type Fence = {
  file: string;
  lang: string;
  code: string;
};

function fences(): Fence[] {
  const out: Fence[] = [];
  for (const file of readdirSync(postsDir).filter((f) => f.endsWith(".md"))) {
    const lines = readFileSync(join(postsDir, file), "utf8").split("\n");
    let open: { fence: string; lang: string; code: string[] } | null = null;
    for (const line of lines) {
      const m = /^(`{3,})(.*)$/.exec(line);
      // Both capture groups participate in any match.
      if (m && !open) open = { fence: m[1]!, lang: m[2]!.trim(), code: [] };
      else if (open && line.startsWith(open.fence)) {
        out.push({ file, lang: open.lang, code: open.code.join("\n") });
        open = null;
      } else if (open) open.code.push(line);
    }
  }
  return out;
}

const unescape = (s: string): string =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

describe("highlighting the full post corpus", () => {
  const blocks = fences();

  it("when extracting fenced blocks from site/posts, finds the expected corpus", () => {
    // Assert
    expect(blocks.length).toBeGreaterThan(100);
  });

  it("when highlighting every fenced block, the markup is well-formed and preserves the code text", () => {
    for (const { file, lang, code } of blocks) {
      // Act
      const html = highlight(code, lang);
      const label = `${file} (${lang || "plain"})`;
      // Assert: only token spans, all balanced, none crossing a newline
      for (const line of html.split("\n")) {
        expect(line.match(/<span class="[a-z]">/g)?.length ?? 0, label).toBe(
          line.match(/<\/span>/g)?.length ?? 0,
        );
      }
      expect(html.replace(/<span class="[a-z]">|<\/span>/g, ""), label).not.toMatch(/[<>]/);
      // Assert: stripping spans and entities restores the input exactly
      expect(unescape(html.replace(/<span class="[a-z]">|<\/span>/g, "")), label).toBe(code);
    }
  });

  it("when wrapping every highlighted block in line numbers, line count matches the code", () => {
    for (const { file, lang, code } of blocks) {
      // Act
      const wrapped = withLineNumbers(highlight(code, lang));
      // Assert
      expect(wrapped.match(/<span class="ln">/g)?.length, `${file} (${lang})`).toBe(
        code.split("\n").length,
      );
    }
  });

  it("when highlighting the labelled corpus languages, every language emits at least one token", () => {
    // Arrange
    const byLang = new Map<string, string[]>();
    for (const { lang, code } of blocks) {
      if (lang) byLang.set(lang, [...(byLang.get(lang) ?? []), code]);
    }
    for (const [lang, codes] of byLang) {
      // Act & Assert
      expect(
        codes.some((code) => /<span class="[a-z]">/.test(highlight(code, lang))),
        lang,
      ).toBe(true);
    }
  });
});
