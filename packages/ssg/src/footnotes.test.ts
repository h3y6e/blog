import { describe, expect, it } from "vite-plus/test";
import { enhanceFootnotes } from "./footnotes.ts";

const article =
  '<p>fact<sup class="footnote-ref"><a href="#fn-1" id="fnref-1">1</a></sup>.</p>\n' +
  '<p>more<sup class="footnote-ref"><a href="#fn-2" id="fnref-2">2</a></sup>.</p>\n' +
  '<section class="footnotes">\n<ol>\n' +
  '<li id="fn-1">note one <a href="#fnref-1" class="footnote-backref">↩</a></li>\n' +
  '<li id="fn-2"><a href="https://example.com">link</a> note <a href="#fnref-2" class="footnote-backref">↩</a></li>\n' +
  "</ol>\n</section>\n";

describe("enhanceFootnotes", () => {
  it("when the article has no footnotes section, returns the HTML unchanged", () => {
    // Arrange
    const html = "<p>plain</p>";
    // Act & Assert
    expect(enhanceFootnotes(html)).toBe(html);
  });

  it("when a footnote is referenced, the ref link keeps its href and gains an interest invoker and anchor name", () => {
    // Act
    const out = enhanceFootnotes(article);
    // Assert
    expect(out).toContain(
      '<a href="#fn-1" id="fnref-1" interestfor="fn-pop-1" style="anchor-name: --fnref-1">1</a>',
    );
  });

  it("when footnotes exist, one popover per footnote is appended with the definition minus the backref link", () => {
    // Act
    const out = enhanceFootnotes(article);
    // Assert
    expect(out).toContain(
      '<div popover="hint" id="fn-pop-1" class="footnote-popover" style="position-anchor: --fnref-1">note one</div>',
    );
    expect(out).toContain(
      '<div popover="hint" id="fn-pop-2" class="footnote-popover" style="position-anchor: --fnref-2">' +
        '<a href="https://example.com">link</a> note</div>',
    );
  });

  it("when the footnotes section is present, its own markup is left untouched", () => {
    // Act
    const out = enhanceFootnotes(article);
    // Assert
    expect(out).toContain(
      '<li id="fn-1">note one <a href="#fnref-1" class="footnote-backref">↩</a></li>',
    );
  });
});
