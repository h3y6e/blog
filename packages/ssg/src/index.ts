import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, resolve, sep } from "node:path";
import { rewriteAssetUrls } from "./assets.ts";
import { loadPosts } from "./content.ts";
import { MODERN_CSS_MARKERS, checkCssLowering, inlineCss } from "./css.ts";
import { type Dims, enhanceMedia, imageSize } from "./images.ts";
import { inlineAssets } from "./inline.ts";
import { checkOriginTrials } from "./origin-trials.ts";
import { buildPages } from "./pages.ts";
import type { SiteConfig } from "./types.ts";

export { html, raw, Raw } from "./html.ts";
export type { OriginTrial } from "./origin-trials.ts";
export type { Post, SiteConfig } from "./types.ts";

export type SsgOptions = SiteConfig;

/** Build inputs, keyed by output chunk name. Both go through Rollup so the
 * output is minified and content-hashed (CSS pulls the fonts along via url()). */
const ENTRIES = {
  a5ebec: "theme/css/a5ebec.css",
  switcher: "theme/scripts/switcher.ts",
  vt: "theme/scripts/vt.ts",
};

const CSS_URL = "/css/a5ebec.css";
const SWITCHER_URL = "/libs/theme/scripts/switcher.js";
const VT_URL = "/libs/theme/scripts/vt.js";

/** Canonical page URL → build input, for every script entry. */
const SCRIPT_URLS: [url: string, entry: string][] = [
  [SWITCHER_URL, ENTRIES.switcher],
  [VT_URL, ENTRIES.vt],
];

/** Files emitted through the asset pipeline at build; pages referencing them
 * are rewritten to the hashed URLs. */
const ASSET_DIRS: [urlPrefix: string, dir: string][] = [
  ["/img/", "img"],
  ["/assets/", "_assets"],
];

/** Dev-only: serve the source files verbatim at the canonical URLs the
 * (unrewritten) pages reference. The build emits hashed assets instead. */
const DEV_STATIC_DIRS: [urlPrefix: string, dir: string][] = [
  ...ASSET_DIRS,
  ["/css/fonts/", "theme/css/fonts"],
];

/** Dev-only: point the module script at its real source so Vite's module
 * graph serves and transforms it (the canonical URL exists only in builds). */
const devScriptUrls = (html: string): string =>
  SCRIPT_URLS.reduce((h, [url, entry]) => h.replace(url, `/${entry}`), html);

const TYPE_HTML = "text/html; charset=utf-8";
const TYPE_CSS = "text/css; charset=utf-8";

const CONTENT_TYPES: Record<string, string> = {
  ".html": TYPE_HTML,
  ".xml": "application/xml; charset=utf-8",
  ".css": TYPE_CSS,
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const contentType = (path: string): string =>
  CONTENT_TYPES[extname(path).toLowerCase()] ?? "application/octet-stream";

/** Request path without query string, percent-decoded. split() always
 * yields at least one element. */
const reqPath = (url: string | undefined): string =>
  decodeURIComponent((url ?? "/").split("?")[0]!);

/** Page files a URL may resolve to, GitHub Pages style: the exact file, or
 * the directory index (with or without the trailing slash). */
const pageKeys = (url: string): string[] =>
  url.endsWith("/") ? [`${url}index.html`] : [url, `${url}/index.html`];

const walk = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name));

type Harvest = {
  css: string;
  scripts: [url: string, code: string][];
  /** Canonical /css/fonts/ URL → hashed URL. */
  fonts: Map<string, string>;
};

/** Pull the page-inlined CSS and script sources plus the hashed font URLs
 * out of the bundle, deleting the entries no page references anymore, and
 * fail the build if the bundler lowered at-Baseline CSS (AGENTS.md policy):
 * every modern marker in the theme must survive to dist. */
function harvestBundle(bundle: Record<string, BundleEntry>, root: string): Harvest {
  const cssPath = resolve(root, ENTRIES.a5ebec);
  const scriptPaths = SCRIPT_URLS.map(([url, entry]) => [url, resolve(root, entry)] as const);
  let css: string | undefined;
  const scripts = new Map<string, string>();
  const fonts = new Map<string, string>();
  const themeDir = dirname(cssPath);
  const themeCss = readdirSync(themeDir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(join(themeDir, f), "utf8"))
    .join("\n");
  // Rollup's generateBundle contract requires mutating `bundle` in place.
  // oxlint-disable eslint/no-param-reassign
  for (const [key, entry] of Object.entries(bundle)) {
    if (entry.type === "chunk") {
      const script = scriptPaths.find(([, path]) => entry.facadeModuleId === path);
      if (script) {
        scripts.set(script[0], entry.code!.trimEnd());
        delete bundle[key];
      }
      // The CSS entry's JS stub chunk serves no page; drop it.
      if (entry.facadeModuleId === cssPath) delete bundle[key];
    }
    // Fonts are emitted from the CSS url()s; expose them at their canonical
    // /css/fonts/ URLs so the head preload links rewrite to the hashed files.
    if (entry.type === "asset" && entry.fileName.endsWith(".woff2")) {
      for (const name of entry.names ?? []) fonts.set(`/css/fonts/${name}`, `/${entry.fileName}`);
    }
    if (entry.type === "asset" && entry.fileName.endsWith(".css")) {
      css =
        typeof entry.source === "string" ? entry.source : new TextDecoder().decode(entry.source);
      checkCssLowering(
        MODERN_CSS_MARKERS.filter((m) => themeCss.includes(m)),
        css,
      );
      delete bundle[key];
    }
  }
  // oxlint-enable eslint/no-param-reassign
  if (css === undefined) throw new Error(`Bundle is missing the entry behind ${CSS_URL}`);
  for (const [url] of SCRIPT_URLS) {
    if (!scripts.has(url)) throw new Error(`Bundle is missing the entry behind ${url}`);
  }
  return { css, scripts: [...scripts.entries()], fonts };
}

const VIRTUAL_PREFIX = "virtual:ssg/";

// Structural subset of Vite's Plugin type; typing it locally keeps this
// package dependent only on @blog/md and @blog/math.
type Plugin = {
  name: string;
  config: () => Record<string, unknown>;
  configResolved: (config: { root: string }) => void;
  resolveId: (id: string) => string | undefined;
  generateBundle: (
    this: {
      emitFile: (file: {
        type: "asset";
        fileName?: string;
        name?: string;
        source: string | Uint8Array;
      }) => string;
      getFileName: (referenceId: string) => string;
    },
    options: unknown,
    bundle: Record<string, BundleEntry>,
  ) => Promise<void>;
  configureServer: (server: DevServer) => () => void;
  configurePreviewServer: (server: PreviewServer) => void;
};

type PreviewServer = {
  config: { root: string };
  middlewares: DevServer["middlewares"];
};

type Res = {
  statusCode: number;
  setHeader: (k: string, v: string) => void;
  end: (body: string | Uint8Array) => void;
};

/** Serve a file with its content type; fonts get Cache-Control (dev 1h,
 * preview mirrors GitHub Pages' 600s) so font-display: optional doesn't fall
 * back on every navigation. */
function sendFile(res: Res, path: string, fontMaxAge: number): void {
  res.setHeader("Content-Type", contentType(path));
  if (path.endsWith(".woff2")) res.setHeader("Cache-Control", `max-age=${fontMaxAge}`);
  res.end(readFileSync(path));
}

type BundleEntry = {
  type: "chunk" | "asset";
  fileName: string;
  facadeModuleId?: string | null;
  source?: string | Uint8Array;
  code?: string;
  names?: string[];
};

type DevServer = {
  config: { root: string };
  watcher: {
    add: (path: string) => void;
    on: (event: string, cb: (path: string) => void) => void;
  };
  ws: { send: (payload: { type: "full-reload" }) => void };
  transformIndexHtml: (url: string, html: string) => Promise<string>;
  middlewares: {
    use: (
      handler: (req: { url?: string }, res: Res, next: (err?: unknown) => void) => void,
    ) => void;
  };
};

export function ssg(options: SsgOptions): Plugin {
  let root = "";
  const postsDir = (): string => resolve(root, options.postsDir);

  let cache: Promise<Map<string, string>> | null = null;
  const pages = (): Promise<Map<string, string>> =>
    (cache ??= loadPosts(postsDir(), resolve(root, options.embedsFile)).then((posts) =>
      buildPages(options, posts),
    ));

  return {
    name: "blog:ssg",

    config: () => ({
      appType: "custom",
      build: {
        rollupOptions: {
          input: Object.fromEntries(Object.keys(ENTRIES).map((k) => [k, VIRTUAL_PREFIX + k])),
        },
      },
    }),

    configResolved(config) {
      root = config.root;
    },

    // The virtual ids exist only because the site root is unknown until
    // configResolved; they resolve to the real entry files.
    resolveId: (id) => {
      const entry = Object.entries(ENTRIES).find(([key]) => VIRTUAL_PREFIX + key === id)?.[1];
      return entry === undefined ? undefined : resolve(root, entry);
    },

    async generateBundle(_options, bundle) {
      // Expired origin trial tokens fail the build; soon-to-expire ones warn.
      for (const warning of checkOriginTrials(options.originTrials ?? [])) console.warn(warning);

      const { css, scripts, fonts } = harvestBundle(bundle, root);
      // Canonical URL → hashed URL for everything Rollup emitted.
      const assets = new Map(fonts);
      const imageDims = new Map<string, Dims>();
      for (const [urlPrefix, dir] of ASSET_DIRS) {
        const abs = resolve(root, dir);
        for (const file of walk(abs)) {
          const source = readFileSync(file);
          const ref = this.emitFile({ type: "asset", name: basename(file), source });
          // Canonical URLs always use "/"; normalize the OS-native separator
          // walk()'s path.join() may have produced (e.g. "\" on Windows).
          const relUrl = file
            .slice(abs.length + 1)
            .split(sep)
            .join("/");
          assets.set(urlPrefix + relUrl, `/${this.getFileName(ref)}`);
          const dims = imageSize(source);
          if (dims) imageDims.set(urlPrefix + relUrl, dims);
        }
      }

      // feed.xml stays byte-identical to the live Franklin feed; every other
      // page gets the CSS and theme scripts inlined, media loading hints, and
      // its asset references pointed at the hashed files.
      for (const [fileName, source] of await pages()) {
        this.emitFile({
          type: "asset",
          fileName,
          source:
            fileName === "feed.xml"
              ? source
              : rewriteAssetUrls(
                  enhanceMedia(inlineAssets(source, css, scripts), imageDims),
                  assets,
                  options.siteUrl,
                ),
        });
      }
    },

    configureServer(server) {
      for (const dir of [options.postsDir, options.embedsFile, "theme", "img", "_assets"]) {
        server.watcher.add(resolve(server.config.root, dir));
      }
      server.watcher.on("all", () => {
        cache = null;
        server.ws.send({ type: "full-reload" });
      });

      // Unlike the build, a near-expiry or expired token only warns here:
      // failing outright would block `vp dev` on a problem the build already
      // enforces before deploy.
      try {
        for (const warning of checkOriginTrials(options.originTrials ?? [])) console.warn(warning);
      } catch (err) {
        console.warn(err instanceof Error ? err.message : String(err));
      }

      // Register after Vite's internal middlewares so /@vite/* keeps working.
      return () => {
        server.middlewares.use((req, res, next) => {
          void (async (): Promise<void> => {
            try {
              const url = reqPath(req.url);
              const send = (body: string, type: string, status = 200): void => {
                // http.ServerResponse's contract requires setting statusCode in place.
                // oxlint-disable-next-line eslint/no-param-reassign
                res.statusCode = status;
                res.setHeader("Content-Type", type);
                res.end(body);
              };

              if (url === CSS_URL) {
                return send(inlineCss(resolve(root, ENTRIES.a5ebec)), TYPE_CSS);
              }
              for (const [urlPrefix, dir] of DEV_STATIC_DIRS) {
                if (url.startsWith(urlPrefix)) {
                  const path = resolve(root, dir, url.slice(urlPrefix.length));
                  if (existsSync(path) && statSync(path).isFile()) return sendFile(res, path, 3600);
                }
              }

              const pagesMap = await pages();
              // Pages are keyed without the leading slash.
              const match = pageKeys(url)
                .map((key): [string, string | undefined] => [key, pagesMap.get(key.slice(1))])
                .find(([, page]) => page !== undefined);
              if (match) {
                const [key, page] = match;
                const type = contentType(key);
                return type === TYPE_HTML
                  ? send(await server.transformIndexHtml(url, devScriptUrls(page!)), TYPE_HTML)
                  : send(page!, type);
              }
              if (extname(url) === "" || url.endsWith(".html")) {
                const notFound = pagesMap.get("404.html")!;
                return send(
                  await server.transformIndexHtml("/404.html", devScriptUrls(notFound)),
                  TYPE_HTML,
                  404,
                );
              }
              next();
            } catch (err) {
              next(err);
            }
          })();
        });
      };
    },

    // appType "custom" turns off Vite's own HTML serving, so preview needs an
    // equivalent static handler over the build output.
    configurePreviewServer(server) {
      const dist = resolve(server.config.root, "dist");
      server.middlewares.use((req, res, next) => {
        const url = reqPath(req.url);
        for (const key of pageKeys(url)) {
          const path = join(dist, key);
          if (existsSync(path) && statSync(path).isFile()) return sendFile(res, path, 600);
        }
        const notFound = join(dist, "404.html");
        if (extname(url) === "" && existsSync(notFound)) {
          // http.ServerResponse's contract requires setting statusCode in place.
          // oxlint-disable-next-line eslint/no-param-reassign
          res.statusCode = 404;
          res.setHeader("Content-Type", TYPE_HTML);
          res.end(readFileSync(notFound));
          return;
        }
        next();
      });
    },
  };
}
