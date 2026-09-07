import { describe, expect, it } from "vite-plus/test";
import { extractHeadings, toc } from "./toc.ts";

const body = [
  '<h2 id="a"><a href="#a" class="header-anchor">Alpha</a></h2>',
  "<p>x</p>",
  '<h3 id="a1"><a href="#a1" class="header-anchor">Alpha One</a></h3>',
  '<h3 id="a2"><a href="#a2" class="header-anchor">Alpha Two</a></h3>',
  '<h2 id="b"><a href="#b" class="header-anchor">Beta</a></h2>',
].join("\n");

describe("extractHeadings", () => {
  it("when the body has h2/h3 with ids, returns level, id and tag-stripped text in order", () => {
    // Act
    const headings = extractHeadings(body);
    // Assert
    expect(headings).toEqual([
      { level: 2, id: "a", text: "Alpha" },
      { level: 3, id: "a1", text: "Alpha One" },
      { level: 3, id: "a2", text: "Alpha Two" },
      { level: 2, id: "b", text: "Beta" },
    ]);
  });
});

describe("toc", () => {
  it("when h3s follow an h2, nests them in an inner ol inside the franklin-toc div", () => {
    // Act
    const out = toc(body);
    // Assert
    expect(out?.html).toBe(
      '<div class="franklin-toc"><ol>' +
        '<li><a href="#a">Alpha</a><ol>' +
        '<li><a href="#a1">Alpha One</a></li>' +
        '<li><a href="#a2">Alpha Two</a></li></ol></li>' +
        '<li><a href="#b">Beta</a></li>' +
        "</ol></div>",
    );
  });

  it("when the body has no headings, returns null", () => {
    // Act & Assert
    expect(toc("<p>plain</p>")).toBeNull();
  });

  it("when an h3 appears before any h2, it becomes its own top-level entry instead of malformed nesting", () => {
    // Arrange
    const leadingH3 = [
      '<h3 id="a1"><a href="#a1" class="header-anchor">Alpha One</a></h3>',
      '<h2 id="b"><a href="#b" class="header-anchor">Beta</a></h2>',
    ].join("\n");
    // Act
    const out = toc(leadingH3);
    // Assert
    expect(out?.html).toBe(
      '<div class="franklin-toc"><ol>' +
        '<li><a href="#a1">Alpha One</a></li>' +
        '<li><a href="#b">Beta</a></li>' +
        "</ol></div>",
    );
  });
});
