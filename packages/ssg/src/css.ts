import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** Modern CSS the theme relies on staying untranspiled (AGENTS.md Baseline
 * policy); checked against the bundle only when present in the source. */
export const MODERN_CSS_MARKERS = [
  "light-dark(",
  "@view-transition",
  "animation-timeline",
  "@starting-style",
  "content-visibility",
];

/**
 * Fail the build if the bundler lowered at-Baseline CSS: a too-low cssTarget
 * makes Lightning CSS rewrite features like light-dark() into broken
 * `--lightningcss-*` fallbacks and strip modern at-rules.
 */
export function checkCssLowering(sourceMarkers: string[], outputCss: string): void {
  const fix = "raise build.cssTarget in site/vite.config.ts to Baseline Newly available browsers";
  if (outputCss.includes("--lightningcss-")) {
    throw new Error(`Bundled CSS contains --lightningcss- transpile fallbacks; ${fix}`);
  }
  for (const marker of sourceMarkers) {
    if (!outputCss.includes(marker)) {
      throw new Error(`Bundled CSS lost "${marker}" from the source theme; ${fix}`);
    }
  }
}

/**
 * Dev-only: inline same-directory `@import "x.css";` statements recursively.
 * `url()` references stay valid because dev serves the fonts at /css/fonts/.
 * The build instead bundles the CSS entry through Vite (minified, hashed,
 * fonts emitted as hashed assets).
 */
export function inlineCss(entry: string): string {
  const dir = dirname(entry);
  return readFileSync(entry, "utf8").replace(/^@import\s+"([^"]+)";$/gm, (_, file) =>
    inlineCss(join(dir, file)),
  );
}
