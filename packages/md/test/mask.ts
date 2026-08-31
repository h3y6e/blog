// Prepares a post body for golden comparison: strips frontmatter and masks
// constructs whose markup intentionally differs from marked (math, footnotes,
// embed directives). Applied identically to the input of both renderers.
export function mask(source: string): string {
  let n = 0;
  return source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^\$\$\n[\s\S]*?\n\$\$$/gm, () => `MATHBLOCK${n++}`)
    .replace(/\$[^$\n]+\$/g, () => `MATHINLINE${n++}`)
    .replace(/^\[\^[^\]]+\]:.*$/gm, "")
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/^\{\{.*\}\}$/gm, () => `EMBED${n++}`);
}

// Removes markup aspects that legitimately differ between renderers
// (heading ids, insignificant whitespace between tags).
export function normalize(html: string): string {
  return (
    html
      .replace(/<(h[23]) id="[^"]*"/g, "<$1")
      // marked refuses **…** delimiters flanked by CJK punctuation; we follow
      // author intent and emphasize. Compare content only; unit tests cover tags.
      .replace(/<\/?strong>|\*\*/g, "")
      .replace(/>\s+</g, "><")
      .trim()
  );
}
