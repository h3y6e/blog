import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { rewriteAssetUrls } from "./assets.ts";
import { loadPosts, type PostEntry, postEntries } from "./content.ts";
import { MODERN_CSS_MARKERS, checkCssLowering, inlineCss } from "./css.ts";
import { type Dims, enhanceMedia, imageSize } from "./images.ts";
import { inlineAssets } from "./inline.ts";
import { checkOriginTrials } from "./origin-trials.ts";
import { buildPages } from "./pages.ts";
import type { Post, SiteConfig } from "./types.ts";
import { pageFile, postDir, postPath, postScriptUrl, postStyleUrl } from "./urls.ts";

export { html, raw, Raw } from "./html.ts";
export type { OriginTrial } from "./origin-trials.ts";
export type { Post, SiteConfig } from "./types.ts";

export type SsgOptions = SiteConfig;

const CSS_ENTRY = "theme/css/a5ebec.css";
const CSS_URL = "/css/a5ebec.css";

const SCRIPT_NAMES = ["switcher", "vt", "webmcp", "webmentions"] as const;
const SCRIPTS: [url: string, path: string][] = SCRIPT_NAMES.map((name) => [
  `/libs/client/${name}.js`,
  fileURLToPath(import.meta.resolve(`@blog/client/${name}.ts`)),
]);

const SOURCE_EXTS = new Set([".ts", ".css"]);

const PUBLIC_DIR = "public";

const devStaticDirs = (postsDir: string): [urlPrefix: string, dir: string][] => [
  ["/posts/", postsDir],
  ["/fonts/", "theme/fonts"],
];

const devScriptUrls = (html: string, scripts: [url: string, path: string][]): string =>
  scripts.reduce((h, [url, path]) => h.replace(url, `/@fs${path}`), html);

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
  inlined: Map<string, string>;
  fonts: Map<string, string>;
};

const text = (source: string | Uint8Array): string =>
  typeof source === "string" ? source : new TextDecoder().decode(source);

function harvestBundle(
  bundle: Record<string, BundleEntry>,
  root: string,
  entries: PostEntry[],
): Harvest {
  const cssPath = resolve(root, CSS_ENTRY);
  const targets: [url: string, path: string][] = [
    [CSS_URL, cssPath],
    ...SCRIPTS,
    ...entries.map((e): [string, string] => [e.url, e.path]),
  ];
  const inlined = new Map<string, string>();
  const cssOwner = new Map<string, string>();
  const fonts = new Map<string, string>();
  // oxlint-disable eslint/no-param-reassign
  for (const [key, entry] of Object.entries(bundle)) {
    if (entry.type !== "chunk") continue;
    const url = targets.find(([, path]) => entry.facadeModuleId === path)?.[0];
    if (url === undefined) continue;
    if (url.endsWith(".js")) inlined.set(url, entry.code!.trimEnd());
    else for (const f of entry.viteMetadata?.importedCss ?? []) cssOwner.set(f, url);
    delete bundle[key];
  }
  for (const [key, entry] of Object.entries(bundle)) {
    if (entry.type !== "asset") continue;
    if (entry.fileName.endsWith(".woff2")) {
      for (const name of entry.names ?? []) fonts.set(`/fonts/${name}`, `/${entry.fileName}`);
    }
    if (!entry.fileName.endsWith(".css")) continue;
    const owner = cssOwner.get(entry.fileName);
    if (owner === undefined) throw new Error(`Bundle has an unowned stylesheet ${entry.fileName}`);
    inlined.set(owner, text(entry.source!));
    delete bundle[key];
  }
  // oxlint-enable eslint/no-param-reassign
  for (const [url] of targets) {
    if (!inlined.has(url)) throw new Error(`Bundle is missing the entry behind ${url}`);
  }
  const themeDir = dirname(cssPath);
  const themeCss = readdirSync(themeDir)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(join(themeDir, f), "utf8"))
    .join("\n");
  checkCssLowering(
    MODERN_CSS_MARKERS.filter((m) => themeCss.includes(m)),
    inlined.get(CSS_URL)!,
  );
  return { inlined, fonts };
}

const VIRTUAL_PREFIX = "virtual:ssg/";

type Plugin = {
  name: string;
  config: (config: { root?: string }) => Record<string, unknown>;
  configResolved: (config: { root: string }) => void;
  resolveId: (id: string) => string | undefined;
  generateBundle: (
    this: {
      emitFile: (file: { type: "asset"; fileName: string; source: string | Uint8Array }) => void;
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
  viteMetadata?: { importedCss: Set<string> };
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
  let entries: PostEntry[] = [];
  const scriptList = (): [url: string, path: string][] => [
    ...SCRIPTS,
    ...entries.filter((e) => e.url.endsWith(".js")).map((e): [string, string] => [e.url, e.path]),
  ];

  let cache: Promise<{ posts: Post[]; pages: Map<string, string> }> | null = null;
  const site = (): Promise<{ posts: Post[]; pages: Map<string, string> }> =>
    (cache ??= loadPosts(postsDir(), resolve(root, options.embedsFile), options.postTypes).then(
      (posts) => ({ posts, pages: buildPages(options, posts) }),
    ));
  const pages = (): Promise<Map<string, string>> => site().then((s) => s.pages);

  return {
    name: "blog:ssg",

    config: (config) => {
      entries = postEntries(resolve(config.root ?? ".", options.postsDir));
      return {
        appType: "custom",
        publicDir: PUBLIC_DIR,
        build: {
          rollupOptions: {
            input: Object.fromEntries([
              ...["a5ebec", ...SCRIPT_NAMES].map((k) => [k, VIRTUAL_PREFIX + k]),
              ...entries.map(({ url, path }) => [url.slice(1), path]),
            ]),
          },
        },
      };
    },

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

      const { inlined, fonts } = harvestBundle(bundle, root, entries);
      const pick = (urls: string[]): [url: string, code: string][] =>
        urls.map((u) => [u, inlined.get(u)!]);
      const assets = new Map(fonts);
      const imageDims = new Map<string, Dims>();
      const publicDir = resolve(root, PUBLIC_DIR);
      if (existsSync(publicDir)) {
        for (const file of walk(publicDir)) {
          const url = `/${relative(publicDir, file).split(sep).join("/")}`;
          const dims = imageSize(readFileSync(file));
          if (dims) imageDims.set(url, dims);
        }
      }

      const { posts, pages: pageMap } = await site();
      for (const post of posts) {
        const dir = resolve(postsDir(), postDir(post));
        const media = walk(dir).filter(
          (f) => basename(f) !== "index.md" && !SOURCE_EXTS.has(extname(f)),
        );
        for (const file of media) {
          const source = readFileSync(file);
          const url = `/posts/${postDir(post)}/${relative(dir, file).split(sep).join("/")}`;
          this.emitFile({ type: "asset", fileName: url.slice(1), source });
          const dims = imageSize(source);
          if (dims) imageDims.set(url, dims);
        }
      }

      const ownPost = new Map(posts.map((post) => [pageFile(postPath(post)), post]));
      const inline = (fileName: string, page: string): string => {
        const post = ownPost.get(fileName);
        const scripts = SCRIPTS.map(([u]) => u).filter(
          (u) => post !== undefined || u !== "/libs/client/webmentions.js",
        );
        return inlineAssets(
          page,
          pick([CSS_URL, ...(post?.style ? [postStyleUrl(post)] : [])]),
          pick([...scripts, ...(post?.script ? [postScriptUrl(post)] : [])]),
        );
      };
      for (const [fileName, source] of pageMap) {
        this.emitFile({
          type: "asset",
          fileName,
          source: fileName.endsWith(".html")
            ? rewriteAssetUrls(
                enhanceMedia(inline(fileName, source), imageDims),
                assets,
                options.siteUrl,
              )
            : source,
        });
      }
    },

    configureServer(server) {
      for (const dir of [options.postsDir, options.embedsFile, "theme", PUBLIC_DIR]) {
        server.watcher.add(resolve(server.config.root, dir));
      }
      for (const [, path] of scriptList()) server.watcher.add(path);
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
                  ? send(
                      await server.transformIndexHtml(url, devScriptUrls(page!, scriptList())),
                      type,
                    )
                  : send(page!, type);
              }
              if (extname(url) === "" || url.endsWith(".html")) {
                const notFound = pagesMap.get("404.html")!;
                return send(
                  await server.transformIndexHtml(
                    "/404.html",
                    devScriptUrls(notFound, scriptList()),
                  ),
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
