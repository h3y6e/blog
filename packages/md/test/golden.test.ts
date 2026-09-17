import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { render } from "../src/index.ts";
import { mask, normalize } from "./mask.ts";

// Generated once from marked (gfm, bare-URL autolinking off), so dropping a golden
// takes that post out of the corpus for good. What mask.ts and normalize hide —
// math, footnotes, embeds, heading ids, strong markers — is in src/index.test.ts.
const posts = join(import.meta.dirname, "../../../site/posts");
const golden = join(import.meta.dirname, "golden");

describe("corpus golden", () => {
  for (const file of readdirSync(golden).filter((f) => f.endsWith(".html"))) {
    it(`when rendering ${file}, the output matches the marked-generated golden`, () => {
      // Arrange
      const source = mask(readFileSync(join(posts, file.replace(/\.html$/, ".md")), "utf8"));
      const want = readFileSync(join(golden, file), "utf8");
      // Act
      const got = render(source);
      // Assert
      expect(normalize(got)).toBe(normalize(want));
    });
  }
});
