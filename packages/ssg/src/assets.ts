const ASSET_URL_PREFIXES = ["/img/", "/assets/", "/css/", "/libs/"];

function rewriteOne(value: string, assets: Map<string, string>, siteUrl: string): string {
  const origin = siteUrl && value.startsWith(`${siteUrl}/`) ? siteUrl : "";
  const path = value.slice(origin.length);
  if (!path.startsWith("/")) return value;
  const hashed = assets.get(path);
  if (hashed) return `${origin}${hashed}`;
  if (ASSET_URL_PREFIXES.some((p) => path.startsWith(p))) {
    throw new Error(`Asset referenced but not emitted: ${value}`);
  }
  return value;
}

export function rewriteAssetUrls(html: string, assets: Map<string, string>, siteUrl = ""): string {
  return html
    .replace(
      /(src|href)="([^"]*)"/g,
      (_attr, name: string, value: string) => `${name}="${rewriteOne(value, assets, siteUrl)}"`,
    )
    .replace(
      /(<meta property="og:image" content=")([^"]*)(")/,
      (_attr, prefix: string, value: string, suffix: string) =>
        `${prefix}${rewriteOne(value, assets, siteUrl)}${suffix}`,
    );
}
