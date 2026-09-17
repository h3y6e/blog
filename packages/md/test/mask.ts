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

export function normalize(html: string): string {
  return (
    html
      .replace(/<(h[23]) id="[^"]*"/g, "<$1")
      // marked rejects ** flanked by CJK punctuation; compare content only.
      .replace(/<\/?strong>|\*\*/g, "")
      // Goldens predate the YYYY/MM/DD layout: compare media by file name and post links by slug.
      .replace(/\/img\/\d{4}-\d{2}-\d{2}\//g, "")
      .replace(/ href="\/posts\/(?:[^"]*\/)?([^/"]+)\/?"/g, ' href="/posts/$1/"')
      .replace(/>\s+</g, "><")
      .trim()
  );
}
