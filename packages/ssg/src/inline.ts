export function inlineAssets(
  page: string,
  css: string,
  scripts: [url: string, code: string][],
): string {
  if (css.includes("</style>")) throw new Error("Bundled CSS contains </style>; cannot inline");
  const link = /<link rel="stylesheet" href="[^"]*" \/>/;
  if (!link.test(page)) throw new Error("Page has no stylesheet link to inline into");
  let out = page.replace(link, () => `<style>${css}</style>`);
  for (const [url, code] of scripts) {
    if (code.includes("</script>")) {
      throw new Error(`Bundled ${url} contains </script>; cannot inline`);
    }
    const forms: [tag: string, inlined: string][] = [
      [`<script type="module" src="${url}"></script>`, `<script type="module">${code}</script>`],
      [`<script src="${url}"></script>`, `<script>${code}</script>`],
    ];
    const hit = forms.find(([tag]) => out.includes(tag));
    if (!hit) throw new Error(`Page has no script tag for ${url}`);
    out = out.replace(hit[0], () => hit[1]);
  }
  return out;
}
