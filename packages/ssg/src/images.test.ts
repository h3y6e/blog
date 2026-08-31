import { describe, expect, it } from "vite-plus/test";
import { enhanceMedia, imageSize } from "./images.ts";

function png(width: number, height: number): Uint8Array {
  const buf = new Uint8Array(24);
  buf.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  new DataView(buf.buffer).setUint32(16, width);
  new DataView(buf.buffer).setUint32(20, height);
  return buf;
}

function jpeg(width: number, height: number, sof = 0xc0): Uint8Array {
  // SOI, APP0 (2-byte length only), SOF marker with height/width big-endian.
  const buf = new Uint8Array([
    0xff,
    0xd8,
    0xff,
    0xe0,
    0x00,
    0x02,
    0xff,
    sof,
    0x00,
    0x11,
    0x08,
    0,
    0,
    0,
    0,
  ]);
  new DataView(buf.buffer).setUint16(11, height);
  new DataView(buf.buffer).setUint16(13, width);
  return buf;
}

function gif(width: number, height: number): Uint8Array {
  const buf = new Uint8Array(10);
  buf.set([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  new DataView(buf.buffer).setUint16(6, width, true);
  new DataView(buf.buffer).setUint16(8, height, true);
  return buf;
}

describe("imageSize", () => {
  it("when given a PNG buffer, the IHDR dimensions are returned", () => {
    // Act & Assert
    expect(imageSize(png(800, 600))).toEqual({ width: 800, height: 600 });
  });

  it("when given a baseline JPEG buffer, the SOF0 dimensions are returned", () => {
    // Act & Assert
    expect(imageSize(jpeg(4032, 3024))).toEqual({ width: 4032, height: 3024 });
  });

  it("when given a progressive JPEG buffer, the SOF2 dimensions are returned", () => {
    // Act & Assert
    expect(imageSize(jpeg(1280, 720, 0xc2))).toEqual({ width: 1280, height: 720 });
  });

  it("when given a GIF buffer, the logical-screen dimensions are returned", () => {
    // Act & Assert
    expect(imageSize(gif(320, 240))).toEqual({ width: 320, height: 240 });
  });

  it("when given an unrecognized buffer, null is returned", () => {
    // Act & Assert
    expect(imageSize(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]))).toBeNull();
    expect(imageSize(new Uint8Array(0))).toBeNull();
  });
});

const dims = new Map([
  ["/assets/kit.jpg", { width: 4032, height: 3024 }],
  ["/assets/plate.png", { width: 800, height: 600 }],
]);

describe("enhanceMedia", () => {
  it("when a page has several images, the first gets fetchpriority and the rest lazy-load, all with dimensions", () => {
    // Arrange
    const html = '<img src="/assets/kit.jpg" alt="kit"><p>x</p><img src="/assets/plate.png">';
    // Act
    const out = enhanceMedia(html, dims);
    // Assert
    expect(out).toBe(
      '<img src="/assets/kit.jpg" alt="kit" width="4032" height="3024" fetchpriority="high" decoding="async"><p>x</p>' +
        '<img src="/assets/plate.png" width="800" height="600" loading="lazy" decoding="async">',
    );
  });

  it("when an image already declares loading, it is left untouched and does not count as the first image", () => {
    // Arrange
    const html =
      '<img src="https://a.example/thumb" decoding="async" loading="lazy">' +
      '<img src="/assets/kit.jpg">';
    // Act
    const out = enhanceMedia(html, dims);
    // Assert
    expect(out).toBe(
      '<img src="https://a.example/thumb" decoding="async" loading="lazy">' +
        '<img src="/assets/kit.jpg" width="4032" height="3024" fetchpriority="high" decoding="async">',
    );
  });

  it("when an image has no known dimensions, loading attributes are still added", () => {
    // Arrange
    const html = '<img src="https://a.example/x.png"><img src="https://a.example/y.png">';
    // Act
    const out = enhanceMedia(html, dims);
    // Assert
    expect(out).toBe(
      '<img src="https://a.example/x.png" fetchpriority="high" decoding="async">' +
        '<img src="https://a.example/y.png" loading="lazy" decoding="async">',
    );
  });

  it("when an image already declares width, dimensions are not added but loading still is", () => {
    // Arrange
    const html =
      '<img src="/assets/kit.jpg" width="100" height="75" loading="eager">' +
      '<img src="/assets/plate.png" width="80">';
    // Act
    const out = enhanceMedia(html, dims);
    // Assert
    expect(out).toBe(
      '<img src="/assets/kit.jpg" width="100" height="75" loading="eager">' +
        '<img src="/assets/plate.png" width="80" loading="lazy" decoding="async">',
    );
  });

  it("when a self-closing figure image is enhanced, the trailing slash is preserved", () => {
    // Arrange
    const html = '<figure><img src="/assets/plate.png" /><figcaption>c</figcaption></figure>';
    // Act
    const out = enhanceMedia(html, dims);
    // Assert
    expect(out).toBe(
      '<figure><img src="/assets/plate.png" width="800" height="600" fetchpriority="high" decoding="async" />' +
        "<figcaption>c</figcaption></figure>",
    );
  });

  it("when an iframe has no loading attribute, lazy loading is added", () => {
    // Arrange
    const html =
      '<iframe src="https://www.youtube.com/embed/x" allowfullscreen></iframe>' +
      '<iframe src="https://open.spotify.com/embed/y" loading="lazy"></iframe>';
    // Act
    const out = enhanceMedia(html, dims);
    // Assert
    expect(out).toBe(
      '<iframe src="https://www.youtube.com/embed/x" allowfullscreen loading="lazy"></iframe>' +
        '<iframe src="https://open.spotify.com/embed/y" loading="lazy"></iframe>',
    );
  });

  it("when img markup appears as escaped text in a code block, it is left untouched", () => {
    // Arrange
    const html = "<code>&lt;img src=&quot;/assets/kit.jpg&quot;&gt;</code>";
    // Act & Assert
    expect(enhanceMedia(html, dims)).toBe(html);
  });
});
