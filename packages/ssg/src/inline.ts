type Inlined = [url: string, code: string][];

export function inlineAssets(page: string, styles: Inlined, scripts: Inlined): string {
  let out = page;
  for (const [url, css] of styles) {
    if (css.includes("</style>"))
      throw new Error(`Bundled ${url} contains </style>; cannot inline`);
    const link = `<link rel="stylesheet" href="${url}" />`;
    if (!out.includes(link)) throw new Error(`Page has no stylesheet link for ${url}`);
    out = out.replace(link, () => `<style>${css}</style>`);
  }
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
