/**
 * Footnote popovers: each footnote ref gets an interest invoker (`interestfor`)
 * opening a hint popover anchored to it, with the footnote text inlined.
 * Progressive enhancement only — the ref stays a plain in-page link, and the
 * popovers are `display: none` unless the Popover API opens them.
 */

const DEFINITION =
  /<li id="fn-(\d+)">([\s\S]*?) <a href="#fnref-\1" class="footnote-backref">↩<\/a><\/li>/g;

export function enhanceFootnotes(article: string): string {
  const defs = new Map<string, string>();
  // Both capture groups participate in any match.
  for (const [, n, def] of article.matchAll(DEFINITION)) defs.set(n!, def!);
  if (defs.size === 0) return article;

  const refs = article.replace(/<a href="#fn-(\d+)" id="fnref-\1">/g, (a, n: string) =>
    defs.has(n)
      ? `<a href="#fn-${n}" id="fnref-${n}" interestfor="fn-pop-${n}" style="anchor-name: --fnref-${n}">`
      : a,
  );
  const popovers = [...defs]
    .map(
      ([n, def]) =>
        `<div popover="hint" id="fn-pop-${n}" class="footnote-popover" style="position-anchor: --fnref-${n}">${def}</div>`,
    )
    .join("\n");
  return `${refs}${popovers}\n`;
}
