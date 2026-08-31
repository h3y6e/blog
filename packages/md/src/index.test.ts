import { describe, expect, it } from "vite-plus/test";
import { render } from "./index.ts";

const highlight = (code: string, lang: string): string => `[${lang}]${code}`;
const math = (tex: string, display: boolean): string => `<math display="${display}">${tex}</math>`;

describe("escaping", () => {
  it("when text contains < > & \" ', they are escaped as entities", () => {
    // Arrange / Act / Assert
    expect(render("a < b > c & \"d\" 'e'")).toBe(
      "<p>a &lt; b &gt; c &amp; &quot;d&quot; &#39;e&#39;</p>\n",
    );
  });
  it("when text contains an existing entity, its ampersand is not double-escaped", () => {
    expect(render("A&mdash;B &c")).toBe("<p>A&mdash;B &amp;c</p>\n");
  });
  it("when code contains an entity, its ampersand is escaped", () => {
    expect(render("`&amp;`")).toBe("<p><code>&amp;amp;</code></p>\n");
  });
});

describe("headings", () => {
  it("when rendering h1 through h4, only h2 and h3 get slugified ids", () => {
    expect(render("# A\n\n## B C\n\n### d-E\n\n#### F")).toBe(
      '<h1>A</h1>\n<h2 id="b-c">B C</h2>\n<h3 id="d-e">d-E</h3>\n<h4>F</h4>\n',
    );
  });
  it("when a heading contains Japanese and punctuation, the id keeps letters and hyphenates spaces", () => {
    expect(render("## ドメイン知識: タマゴ")).toBe(
      '<h2 id="ドメイン知識-タマゴ">ドメイン知識: タマゴ</h2>\n',
    );
  });
  it("when two headings slugify identically, the second id gets a numeric suffix", () => {
    expect(render("## A\n\n## A")).toBe('<h2 id="a">A</h2>\n<h2 id="a-1">A</h2>\n');
  });
  it("when a heading's own text collides with another heading's numeric-suffixed id, both ids stay unique", () => {
    expect(render("## A\n\n## A 1\n\n## A")).toBe(
      '<h2 id="a">A</h2>\n<h2 id="a-1">A 1</h2>\n<h2 id="a-2">A</h2>\n',
    );
  });
  it("when a heading contains a link, the id uses only the link text", () => {
    expect(render("## See [Docs](https://x.test)")).toBe(
      '<h2 id="see-docs">See <a href="https://x.test">Docs</a></h2>\n',
    );
  });
});

describe("code", () => {
  it("when a fenced block has a language, the class names it and content is escaped verbatim", () => {
    expect(render('```html\n<a href="x">&\n```')).toBe(
      '<pre><code class="language-html">&lt;a href=&quot;x&quot;&gt;&amp;\n</code></pre>\n',
    );
  });
  it("when a fenced block has no language, no class is emitted", () => {
    expect(render("```\nx\n```")).toBe("<pre><code>x\n</code></pre>\n");
  });
  it("when a highlight option is given, fenced content uses its html verbatim", () => {
    // Act / Assert
    expect(render("```sh\na < b\n```", { highlight })).toBe(
      '<pre><code class="language-sh">[sh]a < b\n</code></pre>\n',
    );
    expect(render("```\nx\n```", { highlight })).toBe("<pre><code>[]x\n</code></pre>\n");
  });
  it("when an inline code span contains markdown syntax, it stays literal", () => {
    expect(render("`**not bold** $x$`")).toBe("<p><code>**not bold** $x$</code></p>\n");
  });
  it("when a code span is delimited by double backticks, single backticks survive inside", () => {
    expect(render("`` a`b ``")).toBe("<p><code>a`b</code></p>\n");
  });
});

describe("emphasis", () => {
  it("when text is wrapped in ** or __, it becomes strong", () => {
    expect(render("**a** __b__")).toBe("<p><strong>a</strong> <strong>b</strong></p>\n");
  });
  it("when ** delimiters are flanked by CJK punctuation, it still becomes strong", () => {
    expect(render("と思い、**「botにする」**という")).toBe(
      "<p>と思い、<strong>「botにする」</strong>という</p>\n",
    );
  });
  it("when text is wrapped in single * it becomes em, and _ mid-word stays literal", () => {
    expect(render("*a* snake_case_name")).toBe("<p><em>a</em> snake_case_name</p>\n");
  });
  it("when text is wrapped in ~~, it becomes del", () => {
    expect(render("~~gone~~")).toBe("<p><del>gone</del></p>\n");
  });
});

describe("links and images", () => {
  it("when rendering a link whose text has markup, both href and inner markup render", () => {
    expect(render("[**b**](https://x.test/a?q=1)")).toBe(
      '<p><a href="https://x.test/a?q=1"><strong>b</strong></a></p>\n',
    );
  });
  it("when a link destination contains balanced parentheses, the full URL is kept", () => {
    expect(render("[w](https://en.wikipedia.org/wiki/Filler_(linguistics))")).toBe(
      '<p><a href="https://en.wikipedia.org/wiki/Filler_(linguistics)">w</a></p>\n',
    );
  });
  it("when a link destination contains a backslash-escaped parenthesis, the backslash is resolved instead of leaking into the URL", () => {
    expect(render("[w](https://x.test/a\\)b)")).toBe('<p><a href="https://x.test/a)b">w</a></p>\n');
  });
  it("when an image's alt text contains a backslash-escaped bracket, the backslash is resolved", () => {
    expect(render("![a \\] b](/img/x.jpg)")).toBe('<p><img src="/img/x.jpg" alt="a ] b"></p>\n');
  });
  it("when rendering an image, alt text is escaped and no closing slash is emitted", () => {
    expect(render('![a "b"](/img/x.jpg)')).toBe(
      '<p><img src="/img/x.jpg" alt="a &quot;b&quot;"></p>\n',
    );
  });
  it("when a URL is wrapped in angle brackets, it autolinks", () => {
    expect(render("<https://x.test/>")).toBe(
      '<p><a href="https://x.test/">https://x.test/</a></p>\n',
    );
  });
});

describe("lists", () => {
  it("when items are adjacent, the list is tight and items are not wrapped in p", () => {
    expect(render("- a\n- b")).toBe("<ul>\n<li>a</li>\n<li>b</li>\n</ul>\n");
  });
  it("when items are separated by a blank line, every item is wrapped in p", () => {
    expect(render("- a\n\n- b")).toBe("<ul>\n<li><p>a</p></li>\n<li><p>b</p></li>\n</ul>\n");
  });
  it("when an item has an indented sublist, it nests inside the li", () => {
    expect(render("- a\n  - b\n- c")).toBe(
      "<ul>\n<li>a<ul>\n<li>b</li>\n</ul></li>\n<li>c</li>\n</ul>\n",
    );
  });
  it("when an ordered list starts at 0, the start attribute is emitted", () => {
    expect(render("0. a\n1. b")).toBe('<ol start="0">\n<li>a</li>\n<li>b</li>\n</ol>\n');
  });
});

describe("blocks", () => {
  it("when lines are separated by a blank line, two paragraphs are produced", () => {
    expect(render("a\n\nb")).toBe("<p>a</p>\n<p>b</p>\n");
  });
  it("when a line ends with two spaces or a backslash, a br is inserted", () => {
    expect(render("a  \nb\\\nc")).toBe("<p>a<br>b<br>c</p>\n");
  });
  it("when lines start with >, a blockquote wraps the inner blocks", () => {
    expect(render("> a\n> b")).toBe("<blockquote>\n<p>a\nb</p>\n</blockquote>\n");
  });
  it("when a line is ---, a thematic break is produced", () => {
    expect(render("a\n\n---\n\nb")).toBe("<p>a</p>\n<hr>\n<p>b</p>\n");
  });
  it("when a table has alignment colons, align attributes are emitted", () => {
    expect(render("| a | b |\n| :-- | --: |\n| 1 | 2 |")).toBe(
      '<table>\n<thead>\n<tr>\n<th align="left">a</th>\n<th align="right">b</th>\n</tr>\n</thead>\n<tbody><tr>\n<td align="left">1</td>\n<td align="right">2</td>\n</tr>\n</tbody></table>\n',
    );
  });
  it("when a block starts with an HTML tag, it passes through verbatim until a blank line", () => {
    expect(render('<div class="x">\n**raw**\n</div>\n\nafter')).toBe(
      '<div class="x">\n**raw**\n</div><p>after</p>\n',
    );
  });
  it("when a paragraph contains inline HTML, the tags pass through unescaped", () => {
    expect(render("a <kbd>⌘</kbd> b <!-- c -->")).toBe("<p>a <kbd>⌘</kbd> b <!-- c --></p>\n");
  });
});

describe("footnotes", () => {
  it("when a footnote is referenced and defined, a superscript ref and a footnotes section are produced", () => {
    // Arrange
    const source = "text[^歩数]\n\n[^歩数]: 説明です。";
    // Act
    const html = render(source);
    // Assert
    expect(html).toContain('<sup class="footnote-ref"><a href="#fn-1" id="fnref-1">1</a></sup>');
    expect(html).toContain(
      '<li id="fn-1">説明です。 <a href="#fnref-1" class="footnote-backref">↩</a></li>',
    );
  });
  it("when a footnote is referenced but never defined, throws naming the label instead of rendering an empty definition", () => {
    // Act & Assert
    expect(() => render("text[^missing]")).toThrow(/\[\^missing\]/);
  });
  it("when the same label is referenced twice, both refs share one number and only the first carries the backref id", () => {
    const html = render("a[^x] b[^x]\n\n[^x]: def");
    expect(html).toContain('<a href="#fn-1" id="fnref-1">1</a>');
    expect(html).toContain('<a href="#fn-1">1</a>');
  });
  it("when two labels are used, they are numbered in first-reference order", () => {
    const html = render("a[^b] c[^a]\n\n[^a]: A\n[^b]: B");
    expect(html).toContain('<li id="fn-1">B ');
    expect(html).toContain('<li id="fn-2">A ');
  });
});

describe("math", () => {
  it("when a math handler is given, $...$ delegates with display false", () => {
    expect(render("is $70\\%$ here", { math })).toBe(
      '<p>is <math display="false">70\\%</math> here</p>\n',
    );
  });
  it("when a math handler is given, a $$ block delegates with display true", () => {
    expect(render("$$\nx = y\n$$", { math })).toBe('<math display="true">x = y</math>\n');
  });
  it("when no math handler is given, dollar text is left verbatim", () => {
    expect(render("costs $5 or $x$")).toBe("<p>costs $5 or $x$</p>\n");
  });
  it("when a dollar sign sits inside code, the math handler is not invoked", () => {
    expect(render('`echo $A $B`\n\n```sh\nj = "$j $k"\n```', { math })).toBe(
      '<p><code>echo $A $B</code></p>\n<pre><code class="language-sh">j = &quot;$j $k&quot;\n</code></pre>\n',
    );
  });
});
