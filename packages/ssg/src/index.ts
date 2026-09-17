import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteAssetUrls } from "./assets.ts";
import { loadPosts } from "./content.ts";
import { MODERN_CSS_MARKERS, checkCssLowering, inlineCss } from "./css.ts";
import { type Dims, enhanceMedia, imageSize } from "./images.ts";
import { inlineAssets } from "./inline.ts";
import { checkOriginTrials } from "./origin-trials.ts";
import { buildPages } from "./pages.ts";
import type { Post, SiteConfig } from "./types.ts";
import { postDir } from "./urls.ts";

export { html, raw, Raw } from "./html.ts";
export type { OriginTrial } from "./origin-trials.ts";
export type { Post, SiteConfig } from "./types.ts";

export type SsgOptions = SiteConfig;

const CSS_ENTRY = "theme/css/a5ebec.css";
const CSS_URL = "/css/a5ebec.css";

const SCRIPT_NAMES = ["switcher", "vt", "webmcp"] as const;
const SCRIPTS: [url: string, path: string][] = SCRIPT_NAMES.map((name) => [
  `/libs/client/${name}.js`,
  fileURLToPath(import.meta.resolve(`@blog/client/${name}.ts`)),
]);

const ASSET_DIRS: [urlPrefix: string, dir: string][] = [["/assets/", "_assets"]];

const devStaticDirs = (postsDir: string): [urlPrefix: string, dir: string][] => [
  ...ASSET_DIRS,
  ["/posts/", postsDir],
  ["/css/fonts/", "theme/css/fonts"],
];

const devScriptUrls = (html: string): string =>
  SCRIPTS.reduce((h, [url, path]) => h.replace(url, `/@fs${path}`), html);

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
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

const reqPath = (url: string | undefined): string =>
  decodeURIComponent((url ?? "/").split("?")[0]!);

const pageKeys = (url: string): string[] =>
  url.endsWith("/") ? [`${url}index.html`] : [url, `${url}/index.html`];

const walk = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => join(d.parentPath, d.name));

type Harvest = {
  css: string;
  scripts: [url: string, code: string][];
  fonts: Map<string, string>;
};

function harvestBundle(bundle: Record<string, BundleEntry>, root: string): Harvest {
  const cssPath = resolve(root, CSS_ENTRY);
  let css: string | undefined;
  const scripts = new Map<string, string>();
  const fonts = new Map<string, string>();
  const themeDir = dirname(cssPath);
  const themeCss = readdirSync(themeDir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(join(themeDir, f), "utf8"))
    .join("\n");
  // oxlint-disable eslint/no-param-reassign
  for (const [key, entry] of Object.entries(bundle)) {
    if (entry.type === "chunk") {
      const script = SCRIPTS.find(([, path]) => entry.facadeModuleId === path);
      if (script) {
        scripts.set(script[0], entry.code!.trimEnd());
        delete bundle[key];
      }
      if (entry.facadeModuleId === cssPath) delete bundle[key];
    }
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
  for (const [url] of SCRIPTS) {
    if (!scripts.has(url)) throw new Error(`Bundle is missing the entry behind ${url}`);
  }
  return { css, scripts: [...scripts.entries()], fonts };
}

const VIRTUAL_PREFIX = "virtual:ssg/";

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

  let cache: Promise<{ posts: Post[]; pages: Map<string, string> }> | null = null;
  const site = (): Promise<{ posts: Post[]; pages: Map<string, string> }> =>
    (cache ??= loadPosts(postsDir(), resolve(root, options.embedsFile)).then((posts) => ({
      posts,
      pages: buildPages(options, posts),
    })));
  const pages = (): Promise<Map<string, string>> => site().then((s) => s.pages);

  return {
    name: "blog:ssg",

    config: () => ({
      appType: "custom",
      build: {
        rollupOptions: {
          input: Object.fromEntries(
            ["a5ebec", ...SCRIPT_NAMES].map((k) => [k, VIRTUAL_PREFIX + k]),
          ),
        },
      },
    }),

    configResolved(config) {
      root = config.root;
    },

    resolveId: (id) => {
      if (id === VIRTUAL_PREFIX + "a5ebec") return resolve(root, CSS_ENTRY);
      const name = SCRIPT_NAMES.find((n) => VIRTUAL_PREFIX + n === id);
      return name && fileURLToPath(import.meta.resolve(`@blog/client/${name}.ts`));
    },

    async generateBundle(_options, bundle) {
      for (const warning of checkOriginTrials(options.originTrials ?? [])) console.warn(warning);

      const { css, scripts, fonts } = harvestBundle(bundle, root);
      const assets = new Map(fonts);
      const imageDims = new Map<string, Dims>();
      for (const [urlPrefix, dir] of ASSET_DIRS) {
        const abs = resolve(root, dir);
        for (const file of walk(abs)) {
          const source = readFileSync(file);
          const ref = this.emitFile({ type: "asset", name: basename(file), source });
          const relUrl = file
            .slice(abs.length + 1)
            .split(sep)
            .join("/");
          assets.set(urlPrefix + relUrl, `/${this.getFileName(ref)}`);
          const dims = imageSize(source);
          if (dims) imageDims.set(urlPrefix + relUrl, dims);
        }
      }

      const { posts, pages: pageMap } = await site();
      for (const post of posts) {
        const dir = resolve(postsDir(), postDir(post));
        for (const file of walk(dir).filter((f) => basename(f) !== "index.md")) {
          const source = readFileSync(file);
          const url = `/posts/${postDir(post)}/${relative(dir, file).split(sep).join("/")}`;
          this.emitFile({ type: "asset", fileName: url.slice(1), source });
          const dims = imageSize(source);
          if (dims) imageDims.set(url, dims);
        }
      }

      for (const [fileName, source] of pageMap) {
        this.emitFile({
          type: "asset",
          fileName,
          source: fileName.endsWith(".html")
            ? rewriteAssetUrls(
                enhanceMedia(inlineAssets(source, css, scripts), imageDims),
                assets,
                options.siteUrl,
              )
            : source,
        });
      }
    },

    configureServer(server) {
      for (const dir of [options.postsDir, options.embedsFile, "theme", "_assets"]) {
        server.watcher.add(resolve(server.config.root, dir));
      }
      for (const [, path] of SCRIPTS) server.watcher.add(path);
      server.watcher.on("all", () => {
        cache = null;
        server.ws.send({ type: "full-reload" });
      });

      try {
        for (const warning of checkOriginTrials(options.originTrials ?? [])) console.warn(warning);
      } catch (err) {
        console.warn(err instanceof Error ? err.message : String(err));
      }

      server.middlewares.use((req, res, next) => {
        void (async (): Promise<void> => {
          try {
            const url = reqPath(req.url);
            const page = url.endsWith(".md") ? (await pages()).get(url.slice(1)) : undefined;
            if (page === undefined) return next();
            res.setHeader("Content-Type", CONTENT_TYPES[".md"]!);
            res.end(page);
          } catch (err) {
            next(err);
          }
        })();
      });

      return () => {
        server.middlewares.use((req, res, next) => {
          void (async (): Promise<void> => {
            try {
              const url = reqPath(req.url);
              const send = (body: string, type: string, status = 200): void => {
                // oxlint-disable-next-line eslint/no-param-reassign
                res.statusCode = status;
                res.setHeader("Content-Type", type);
                res.end(body);
              };

              if (url === CSS_URL) {
                return send(inlineCss(resolve(root, CSS_ENTRY)), CONTENT_TYPES[".css"]!);
              }
              for (const [urlPrefix, dir] of devStaticDirs(options.postsDir)) {
                if (url.startsWith(urlPrefix)) {
                  const path = resolve(root, dir, url.slice(urlPrefix.length));
                  if (existsSync(path) && statSync(path).isFile()) return sendFile(res, path, 3600);
                }
              }

              const pagesMap = await pages();
              const match = pageKeys(url)
                .map((key): [string, string | undefined] => [key, pagesMap.get(key.slice(1))])
                .find(([, page]) => page !== undefined);
              if (match) {
                const [key, page] = match;
                const type = contentType(key);
                return key.endsWith(".html")
                  ? send(await server.transformIndexHtml(url, devScriptUrls(page!)), type)
                  : send(page!, type);
              }
              if (extname(url) === "" || url.endsWith(".html")) {
                const notFound = pagesMap.get("404.html")!;
                return send(
                  await server.transformIndexHtml("/404.html", devScriptUrls(notFound)),
                  CONTENT_TYPES[".html"]!,
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
          // oxlint-disable-next-line eslint/no-param-reassign
          res.statusCode = 404;
          res.setHeader("Content-Type", CONTENT_TYPES[".html"]!);
          res.end(readFileSync(notFound));
          return;
        }
        next();
      });
    },
  };
}
