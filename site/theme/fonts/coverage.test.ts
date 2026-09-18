import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";

// Same as TEXT_SOURCES in generate.py.
const TEXT_SOURCES = ["posts/**/*.md", "embeds.json", "../packages/ssg/src/*.ts"];
const FONTS = import.meta.dirname;
const SITE = join(FONTS, "../..");

const codepoints = (text: string): string[] => Array.from(text).filter((c) => !/\s/.test(c));

test("when a character appears on the site, the Firge35Nerd Console subset was generated with it", () => {
  // Arrange
  const known = new Set(
    codepoints(readFileSync(join(FONTS, "Firge35NerdConsole.chars.txt"), "utf8")),
  );
  const files = TEXT_SOURCES.flatMap((pattern) => globSync(pattern, { cwd: SITE }));
  const used = new Set(files.flatMap((file) => codepoints(readFileSync(join(SITE, file), "utf8"))));

  // Act
  const missing = [...used].filter((c) => !known.has(c));

  // Assert
  expect(missing, "regenerate with: uv run site/theme/fonts/generate.py").toEqual([]);
});
