import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const MODERN_CSS_MARKERS = [
  "light-dark(",
  "@view-transition",
  "animation-timeline",
  "@starting-style",
  "content-visibility",
];

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

export function inlineCss(entry: string): string {
  const dir = dirname(entry);
  return readFileSync(entry, "utf8").replace(/^@import\s+"([^"]+)";$/gm, (_, file) =>
    inlineCss(join(dir, file)),
  );
}
