import { describe, expect, it } from "vite-plus/test";
import { highlight, withLineNumbers } from "./index.ts";

/** Strips token spans and decodes entities; the result must equal the input code. */
const plainText = (html: string): string =>
  html
    .replace(/<\/?span[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

describe("highlight", () => {
  it("when the language is unknown or empty, returns the escaped code unchanged", () => {
    // Arrange
    const code = 'a < b && c > "d"';
    // Act & Assert
    expect(highlight(code, "")).toBe("a &lt; b &amp;&amp; c &gt; &quot;d&quot;");
    expect(highlight(code, "brainfuck")).toBe(highlight(code, ""));
  });

  it("when highlighting bash, marks comments, strings, variables and keywords", () => {
    // Arrange
    const code = "if [ -z $HOME ]; then\n  echo 'empty' # note\nfi";
    // Act
    const html = highlight(code, "bash");
    // Assert
    expect(html).toContain('<span class="k">if</span>');
    expect(html).toContain('<span class="k">then</span>');
    expect(html).toContain('<span class="k">fi</span>');
    expect(html).toContain('<span class="b">echo</span>');
    expect(html).toContain('<span class="v">$HOME</span>');
    expect(html).toContain('<span class="s">&#39;empty&#39;</span>');
    expect(html).toContain('<span class="c"># note</span>');
  });

  it("when highlighting sh and shell, produces the same output as bash", () => {
    // Arrange
    const code = "export PATH=$PATH:/usr/bin";
    // Act & Assert
    expect(highlight(code, "sh")).toBe(highlight(code, "bash"));
    expect(highlight(code, "shell")).toBe(highlight(code, "bash"));
  });

  it("when highlighting yaml, marks keys, strings, literals and bullets", () => {
    // Arrange
    const code = 'jobs:\n  - name: "build"\n    fast: true # ok';
    // Act
    const html = highlight(code, "yaml");
    // Assert
    expect(html).toContain('<span class="a">jobs</span>');
    expect(html).toContain('<span class="a">name</span>');
    expect(html).toContain('<span class="u">-</span>');
    expect(html).toContain('<span class="s">&quot;build&quot;</span>');
    expect(html).toContain('<span class="l">true</span>');
    expect(html).toContain('<span class="c"># ok</span>');
  });

  it("when a yaml value is a block scalar, treats the indented block as a string, not yaml", () => {
    // Arrange
    const code = "prompt: |\n  # not a comment\n  line two\nnext: 1";
    // Act
    const html = highlight(code, "yaml");
    // Assert
    expect(html).not.toContain('<span class="c">');
    expect(html).toContain('<span class="s">  # not a comment</span>');
    expect(html).toContain('<span class="a">next</span>');
  });

  it("when highlighting julia, marks keywords, macros, strings and numbers", () => {
    // Arrange
    const code = 'for j = 1:N\n  @test f("x") ≈ 2.5 # ok\nend';
    // Act
    const html = highlight(code, "julia");
    // Assert
    expect(html).toContain('<span class="k">for</span>');
    expect(html).toContain('<span class="k">end</span>');
    expect(html).toContain('<span class="m">@test</span>');
    expect(html).toContain('<span class="s">&quot;x&quot;</span>');
    expect(html).toContain('<span class="n">2.5</span>');
    expect(html).toContain('<span class="c"># ok</span>');
  });

  it("when highlighting cxx, marks preprocessor lines, types, keywords and comments", () => {
    // Arrange
    const code = "#include <stdio.h>\nint main() {\n  return 0; /* done */\n}";
    // Act
    const html = highlight(code, "cxx");
    // Assert
    expect(html).toContain('<span class="m">#include &lt;stdio.h&gt;</span>');
    expect(html).toContain('<span class="t">int</span>');
    expect(html).toContain('<span class="k">return</span>');
    expect(html).toContain('<span class="c">/* done */</span>');
  });

  it("when highlighting markdown, marks headings, bullets, emphasis and code spans", () => {
    // Arrange
    const code = "# Title\n\n- item with **bold** and `code`";
    // Act
    const html = highlight(code, "markdown");
    // Assert
    expect(html).toContain('<span class="h"># Title</span>');
    expect(html).toContain('<span class="u">-</span>');
    expect(html).toContain('<span class="w">**bold**</span>');
    expect(html).toContain('<span class="d">`code`</span>');
  });

  it("when highlighting toml or ini, marks sections, keys and values", () => {
    // Arrange
    const code = "[tagpr]\nreleaseBranch = main\nvPrefix = true\ncount = 3";
    // Act
    const html = highlight(code, "ini");
    // Assert
    expect(html).toContain('<span class="h">[tagpr]</span>');
    expect(html).toContain('<span class="a">releaseBranch</span>');
    expect(html).toContain('<span class="l">true</span>');
    expect(html).toContain('<span class="n">3</span>');
    expect(highlight(code, "toml")).toBe(highlight(code, "ini"));
  });

  it("when highlighting typescript, marks keywords, strings and built-ins", () => {
    // Arrange
    const code = 'const x: string = "hi";\nconsole.log(`${x}!`); // done';
    // Act
    const html = highlight(code, "ts");
    // Assert
    expect(html).toContain('<span class="k">const</span>');
    expect(html).toContain('<span class="s">&quot;hi&quot;</span>');
    expect(html).toContain('<span class="b">console</span>');
    expect(html).toContain('<span class="c">// done</span>');
    expect(highlight(code, "typescript")).toBe(html);
    expect(highlight("var a = 1", "js")).toBe(highlight("var a = 1", "javascript"));
  });

  it("when highlighting json, distinguishes keys from string values", () => {
    // Arrange
    const code = '{ "name": "blog", "n": 1, "ok": true }';
    // Act
    const html = highlight(code, "json");
    // Assert
    expect(html).toContain('<span class="a">&quot;name&quot;</span>');
    expect(html).toContain('<span class="s">&quot;blog&quot;</span>');
    expect(html).toContain('<span class="n">1</span>');
    expect(html).toContain('<span class="l">true</span>');
  });

  it("when highlighting html, marks tags, attributes and attribute values", () => {
    // Arrange
    const code = '<a href="https://x.test" target="_blank">link</a><!-- c -->';
    // Act
    const html = highlight(code, "html");
    // Assert
    expect(html).toContain('<span class="g">&lt;a</span>');
    expect(html).toContain('<span class="a">href</span>');
    expect(html).toContain('<span class="s">&quot;https://x.test&quot;</span>');
    expect(html).toContain('<span class="c">&lt;!-- c --&gt;</span>');
    expect(highlight(code, "xml")).toBe(html);
  });

  it("when highlighting vim, marks comments, strings and settings", () => {
    // Arrange
    const code = "\" my config\nset number\nlet g:x = 'y'";
    // Act
    const html = highlight(code, "vim");
    // Assert
    expect(html).toContain('<span class="c">&quot; my config</span>');
    expect(html).toContain('<span class="k">set</span>');
    expect(html).toContain('<span class="s">&#39;y&#39;</span>');
  });

  it("when highlighting any language, preserves the exact code text under the markup", () => {
    // Arrange
    const code = 'if [ "$a" != "<b>" ]; then\n  echo \'&\' # 100% "quoted"\nfi';
    for (const lang of [
      "bash",
      "yaml",
      "julia",
      "cxx",
      "markdown",
      "toml",
      "ts",
      "vim",
      "ini",
      "json",
      "html",
      "",
    ]) {
      // Act & Assert
      expect(plainText(highlight(code, lang)), lang).toBe(code);
    }
  });

  it("when a token spans multiple lines, splits it so no span crosses a newline", () => {
    // Arrange
    const code = "/* one\ntwo */";
    // Act
    const html = highlight(code, "cxx");
    // Assert
    expect(html).toBe('<span class="c">/* one</span>\n<span class="c">two */</span>');
  });
});

describe("withLineNumbers", () => {
  it("when given multi-line html, wraps each line in a line span", () => {
    // Act & Assert
    expect(withLineNumbers("a\n\nb")).toBe(
      '<span class="ln">a</span>\n<span class="ln"></span>\n<span class="ln">b</span>',
    );
  });
});
