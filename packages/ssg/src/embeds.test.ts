import { mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { ensureEmbeds, extractEmbedMeta, fetchEmbedMeta } from "./embeds.ts";

describe("extractEmbedMeta", () => {
  it("when og meta tags use the property attribute, extracts image, title, and description", () => {
    // Arrange
    const html =
      `<html><head>` +
      `<meta property="og:title" content="A Title">` +
      `<meta property="og:description" content="A description.">` +
      `<meta property="og:image" content="https://x.example/og.png">` +
      `</head></html>`;
    // Act
    const meta = extractEmbedMeta(html, "https://x.example/page");
    // Assert
    expect(meta).toEqual({
      image: "https://x.example/og.png",
      title: "A Title",
      description: "A description.",
    });
  });

  it("when og meta tags use the name attribute instead of property, still extracts them", () => {
    // Arrange
    const html = `<meta name="og:title" content="Named"><meta name="og:image" content="https://x.example/i.png">`;
    // Act
    const meta = extractEmbedMeta(html, "https://x.example/");
    // Assert
    expect(meta.title).toBe("Named");
    expect(meta.image).toBe("https://x.example/i.png");
  });

  it("when content precedes property and attributes use single quotes, still extracts them", () => {
    // Arrange
    const html = `<meta content='Reversed' property='og:title'/>`;
    // Act
    const meta = extractEmbedMeta(html, "https://x.example/");
    // Assert
    expect(meta.title).toBe("Reversed");
  });

  it("when og:image is relative (as on normalize.fm), resolves it against the page URL", () => {
    // Arrange
    const html = `<meta property="og:image" content="/resource/normalize-logo.jpg">`;
    // Act
    const meta = extractEmbedMeta(html, "https://normalize.fm");
    // Assert
    expect(meta.image).toBe("https://normalize.fm/resource/normalize-logo.jpg");
  });

  it("when og tags are absent, falls back to the title element and meta description", () => {
    // Arrange
    const html =
      `<html><head><title> Fallback Title </title>` +
      `<meta name="description" content="Fallback description."></head></html>`;
    // Act
    const meta = extractEmbedMeta(html, "https://x.example/");
    // Assert
    expect(meta).toEqual({
      image: "",
      title: "Fallback Title",
      description: "Fallback description.",
    });
  });

  it("when the page has no usable metadata at all, returns empty strings", () => {
    // Arrange & Act
    const meta = extractEmbedMeta("<html><body>hi</body></html>", "https://x.example/");
    // Assert
    expect(meta).toEqual({ image: "", title: "", description: "" });
  });

  it("when metadata contains HTML entities, decodes them", () => {
    // Arrange
    const html = `<title>Calendar Versioning &#8212; CalVer &amp; more</title>`;
    // Act
    const meta = extractEmbedMeta(html, "https://calver.org");
    // Assert
    expect(meta.title).toBe("Calendar Versioning — CalVer & more");
  });

  it("when duplicate og tags exist, keeps the first occurrence", () => {
    // Arrange
    const html = `<meta property="og:title" content="First"><meta property="og:title" content="Second">`;
    // Act
    const meta = extractEmbedMeta(html, "https://x.example/");
    // Assert
    expect(meta.title).toBe("First");
  });
});

describe("fetchEmbedMeta", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("when the response is non-2xx, throws an error naming the URL and status", async () => {
    // Arrange
    vi.stubGlobal("fetch", async () => new Response("gone", { status: 404 }));
    // Act & Assert
    await expect(fetchEmbedMeta("https://x.example/missing")).rejects.toThrow(
      "failed to fetch embed metadata for https://x.example/missing: HTTP 404",
    );
  });

  it("when the fetch itself fails (network error or timeout), throws an error naming the URL", async () => {
    // Arrange
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("fetch failed");
    });
    // Act & Assert
    await expect(fetchEmbedMeta("https://down.example/")).rejects.toThrow(
      "failed to fetch embed metadata for https://down.example/",
    );
  });
});

describe("ensureEmbeds", () => {
  const CACHED: Record<string, unknown> = {
    "https://b.example/": { image: "", title: "B", description: "" },
    "https://d.example/gone": null,
  };

  function tempEmbedsFile(): string {
    const file = join(mkdtempSync(join(tmpdir(), "embeds-")), "embeds.json");
    writeFileSync(file, `${JSON.stringify(CACHED, null, 2)}\n`);
    return file;
  }

  const originalCi = process.env.CI;
  afterEach(() => {
    if (originalCi === undefined) delete process.env.CI;
    else process.env.CI = originalCi;
  });

  it("when every URL is already cached (including null entries), returns the cache without fetching or rewriting", async () => {
    // Arrange
    delete process.env.CI;
    const file = tempEmbedsFile();
    const before = statSync(file).mtimeMs;
    const fetchMeta = vi.fn();
    // Act
    const embeds = await ensureEmbeds(
      ["https://b.example/", "https://d.example/gone"],
      file,
      fetchMeta,
    );
    // Assert
    expect(embeds).toEqual(CACHED);
    expect(fetchMeta).not.toHaveBeenCalled();
    expect(statSync(file).mtimeMs).toBe(before);
  });

  it("when a URL is missing locally, fetches it and persists the merged cache with sorted keys and 2-space indent", async () => {
    // Arrange
    delete process.env.CI;
    const file = tempEmbedsFile();
    const meta = { image: "https://a.example/og.png", title: "A", description: "d" };
    const fetchMeta = vi.fn(async () => meta);
    // Act
    const embeds = await ensureEmbeds(
      ["https://b.example/", "https://a.example/", "https://a.example/"],
      file,
      fetchMeta,
    );
    // Assert
    expect(fetchMeta).toHaveBeenCalledExactlyOnceWith("https://a.example/");
    expect(embeds["https://a.example/"]).toEqual(meta);
    const written = readFileSync(file, "utf8");
    expect(written).toBe(`${JSON.stringify({ "https://a.example/": meta, ...CACHED }, null, 2)}\n`);
  });

  it("when CI is set and a URL is missing, returns the cache untouched without fetching", async () => {
    // Arrange
    process.env.CI = "true";
    const file = tempEmbedsFile();
    const fetchMeta = vi.fn();
    // Act
    const embeds = await ensureEmbeds(["https://a.example/"], file, fetchMeta);
    // Assert
    expect(fetchMeta).not.toHaveBeenCalled();
    expect(embeds).toEqual(CACHED);
    expect(readFileSync(file, "utf8")).toBe(`${JSON.stringify(CACHED, null, 2)}\n`);
  });

  it("when fetching a missing URL fails, rejects without rewriting the cache file", async () => {
    // Arrange
    delete process.env.CI;
    const file = tempEmbedsFile();
    const fetchMeta = vi.fn(async (url: string) => {
      throw new Error(`failed to fetch embed metadata for ${url}`);
    });
    // Act & Assert
    await expect(ensureEmbeds(["https://a.example/"], file, fetchMeta)).rejects.toThrow(
      "https://a.example/",
    );
    expect(readFileSync(file, "utf8")).toBe(`${JSON.stringify(CACHED, null, 2)}\n`);
  });
});
