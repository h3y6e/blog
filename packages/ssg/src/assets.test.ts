import { describe, expect, it } from "vite-plus/test";
import { rewriteAssetUrls } from "./assets.ts";

const assets = new Map([
  ["/img/2022-03-15/plate.jpg", "/assets/plate-B3v9xQ2k.jpg"],
  ["/assets/2f2f2f.jpg", "/assets/2f2f2f-Cx1YpF0a.jpg"],
  ["/assets/favicon/favicon.ico", "/assets/favicon-D4kW8mNz.ico"],
  ["/css/a5ebec.css", "/assets/a5ebec-Bq7Rt5Lm.css"],
  ["/libs/client/switcher.js", "/assets/switcher-CpZ2vH9d.js"],
]);

describe("rewriteAssetUrls", () => {
  it("when an img src uses a mapped root-relative path, it is rewritten to the hashed URL", () => {
    // Act
    const out = rewriteAssetUrls('<img src="/img/2022-03-15/plate.jpg" alt="plate">', assets);
    // Assert
    expect(out).toBe('<img src="/assets/plate-B3v9xQ2k.jpg" alt="plate">');
  });

  it("when href and content attributes use mapped paths, both are rewritten", () => {
    // Act
    const out = rewriteAssetUrls(
      '<link rel="icon" href="/assets/favicon/favicon.ico" />' +
        '<link rel="stylesheet" href="/css/a5ebec.css" />' +
        '<script type="module" src="/libs/client/switcher.js"></script>',
      assets,
    );
    // Assert
    expect(out).toBe(
      '<link rel="icon" href="/assets/favicon-D4kW8mNz.ico" />' +
        '<link rel="stylesheet" href="/assets/a5ebec-Bq7Rt5Lm.css" />' +
        '<script type="module" src="/assets/switcher-CpZ2vH9d.js"></script>',
    );
  });

  it("when a mapped path is prefixed with the site origin, the origin is preserved and the path rewritten", () => {
    // Act
    const out = rewriteAssetUrls(
      '<meta property="og:image" content="https://blog.h3y6e.com/assets/2f2f2f.jpg" />',
      assets,
      "https://blog.h3y6e.com",
    );
    // Assert
    expect(out).toBe(
      '<meta property="og:image" content="https://blog.h3y6e.com/assets/2f2f2f-Cx1YpF0a.jpg" />',
    );
  });

  it("when attributes reference pages, external URLs, or non-asset paths, they pass through unchanged", () => {
    // Arrange
    const html =
      '<a href="/posts/a2net/">a</a><a href="/feed.xml">rss</a>' +
      '<a href="https://example.com/img/x.png">ext</a>' +
      '<meta content="https://blog.h3y6e.com/posts/a2net/index.html" />' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" />';
    // Act & Assert
    expect(rewriteAssetUrls(html, assets, "https://blog.h3y6e.com")).toBe(html);
  });

  it("when prose or code blocks mention an asset path outside an attribute, the text is left untouched", () => {
    // Arrange
    const html = "<code>curl /img/2022-03-15/plate.jpg</code><p>see /assets/2f2f2f.jpg</p>";
    // Act & Assert
    expect(rewriteAssetUrls(html, assets)).toBe(html);
  });

  it("when a description's content attribute starts with an asset-like path, it is left untouched", () => {
    // Arrange
    const html =
      '<meta name="description" content="/img/を使った話" />' +
      '<meta property="og:description" content="/img/を使った話" />';
    // Act & Assert
    expect(rewriteAssetUrls(html, assets)).toBe(html);
  });

  it("when an attribute references an asset path with no emitted file, rewriting throws", () => {
    // Act & Assert
    expect(() => rewriteAssetUrls('<img src="/img/missing.png">', assets)).toThrow(
      "/img/missing.png",
    );
    expect(() => rewriteAssetUrls('<script src="/libs/client/gone.js"></script>', assets)).toThrow(
      "/libs/client/gone.js",
    );
  });
});
