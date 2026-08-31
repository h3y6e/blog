import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { render } from "../src/index.ts";
import { mask, normalize } from "./mask.ts";

// Goldens were generated once from marked (gfm, bare-URL autolinking off); math,
// footnotes and embed directives are masked, heading ids and strong markers
// are normalized out — those aspects are specified in src/index.test.ts.
const posts = join(import.meta.dirname, "../../../site/posts");
const golden = join(import.meta.dirname, "golden");

describe("corpus golden", () => {
  for (const file of readdirSync(posts).filter((f) => f.endsWith(".md"))) {
    it(`when rendering ${file}, the output matches the marked-generated golden`, () => {
      // Arrange
      const source = mask(readFileSync(join(posts, file), "utf8"));
      const want = readFileSync(join(golden, file.replace(/\.md$/, ".html")), "utf8");
      // Act
      const got = render(source);
      // Assert
      expect(normalize(got)).toBe(normalize(want));
    });
  }
});
