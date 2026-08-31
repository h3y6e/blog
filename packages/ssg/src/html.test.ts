import { describe, expect, it } from "vite-plus/test";
import { escapeHtml, html, raw, Raw } from "./html.ts";

describe("escapeHtml", () => {
  it("when given the five HTML special characters, replaces each with its entity", () => {
    // Arrange
    const input = `&<>"'`;
    // Act
    const out = escapeHtml(input);
    // Assert
    expect(out).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});

describe("html", () => {
  it("when a string is interpolated, escapes it so markup cannot be injected", () => {
    // Arrange
    const xss = `<script>alert("x")</script>`;
    // Act
    const out = html`<p>${xss}</p>`;
    // Assert
    expect(out.html).toBe("<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>");
  });

  it("when a value is interpolated into an attribute, escapes quotes so the attribute cannot be broken out of", () => {
    // Arrange
    const evil = `" onmouseover="alert(1)`;
    // Act
    const out = html`<a title="${evil}">x</a>`;
    // Assert
    expect(out.html).toBe('<a title="&quot; onmouseover=&quot;alert(1)">x</a>');
  });

  it("when raw() wraps a string, inserts it unescaped", () => {
    // Arrange
    const markup = "<em>hi</em>";
    // Act
    const out = html`<p>${raw(markup)}</p>`;
    // Assert
    expect(out.html).toBe("<p><em>hi</em></p>");
  });

  it("when a nested html`` result is interpolated, inserts it unescaped", () => {
    // Arrange
    const inner = html`<b>${"a&b"}</b>`;
    // Act
    const out = html`<p>${inner}</p>`;
    // Assert
    expect(out.html).toBe("<p><b>a&amp;b</b></p>");
  });

  it("when an array is interpolated, flattens it with each element escaped", () => {
    // Arrange
    const items = ["a<b", raw("<i>c</i>"), ["d", "e"]];
    // Act
    const out = html`<p>${items}</p>`;
    // Assert
    expect(out.html).toBe("<p>a&lt;b<i>c</i>de</p>");
  });

  it("when null, undefined or a boolean is interpolated, renders nothing", () => {
    // Act
    const out = html`<p>${null}${undefined}${false}${true}</p>`;
    // Assert
    expect(out.html).toBe("<p></p>");
  });

  it("when a number is interpolated, renders its decimal form", () => {
    // Act
    const out = html`<p>${2026}</p>`;
    // Assert
    expect(out.html).toBe("<p>2026</p>");
  });

  it("when the template renders, returns a Raw whose toString equals its html", () => {
    // Act
    const out = html`<p>x</p>`;
    // Assert
    expect(out).toBeInstanceOf(Raw);
    expect(String(out)).toBe("<p>x</p>");
  });

  it("when template literals span lines, collapses the indentation to single spaces", () => {
    // Act
    const out = html`<head>
      <meta charset="utf-8" />
      <title>${"t"}</title>
    </head>`;
    // Assert
    expect(out.html).toBe('<head> <meta charset="utf-8" /> <title>t</title> </head>');
  });

  it("when interpolated values contain newlines, leaves them untouched (post bodies keep their pre blocks)", () => {
    // Arrange (aliased tag: oxfmt reformats whitespace inside html`` literals)
    const tag = html;
    const body = raw("<pre>a\n  b</pre>");
    // Act
    const out = tag`<div>\n  ${body}\n</div>`;
    // Assert
    expect(out.html).toBe("<div> <pre>a\n  b</pre> </div>");
  });
});
