import { describe, expect, it } from "vite-plus/test";
import { collectEmbedUrls, expandShortcodes } from "./shortcodes.ts";

const embeds = {
  "https://calver.org": {
    image: "",
    title: "Calendar Versioning — CalVer",
    description: "Timely Project Versioning",
  },
  "https://example.com/gone": null,
};

describe("expandShortcodes", () => {
  it("when a line is an embed shortcode whose metadata has no image, replaces it with an imageless card", () => {
    // Arrange
    const markdown = "before\n\n{{ embed https://calver.org }}\n\nafter\n";
    // Act
    const out = expandShortcodes(markdown, embeds);
    // Assert
    expect(out).toBe(
      "before\n\n" +
        '<div class="embed" ontouchstart=""><div class="embed-content"><b>Calendar Versioning — CalVer</b><p>Timely Project Versioning</p><div class="domain">calver.org</div></div><a href="https://calver.org" rel="noopener noreferrer nofollow" target="_blank" role="link"></a></div>\n' +
        "\nafter\n",
    );
  });

  it("when an embed shortcode carries a label, ignores the label like Franklin's hfun_embed did", () => {
    // Arrange
    const markdown = '{{ embed https://calver.org "some label" }}\n';
    // Act
    const out = expandShortcodes(markdown, embeds);
    // Assert
    expect(out).toBe(expandShortcodes("{{ embed https://calver.org }}\n", embeds));
    expect(out).toContain('<div class="embed"');
  });

  it("when embed metadata is null (page was unreachable at harvest time), renders only a blank line", () => {
    // Arrange
    const markdown = "before\n\n{{ embed https://example.com/gone }}\n\nafter\n";
    // Act
    const out = expandShortcodes(markdown, embeds);
    // Assert
    expect(out).toBe("before\n\n\n\nafter\n");
  });

  it("when an embed URL has no entry in the metadata map, throws naming the URL", () => {
    // Arrange
    const markdown = "{{ embed https://unknown.example }}\n";
    // Act & Assert
    expect(() => expandShortcodes(markdown, embeds)).toThrow("https://unknown.example");
  });

  it("when metadata contains HTML-special characters, escapes them in the card", () => {
    // Arrange
    const markdown = "{{ embed https://calver.org }}\n";
    const spicy = {
      "https://calver.org": {
        image: 'https://x.example/og.png?a=1&b="2"',
        title: "A & B <C>",
        description: 'say "hi" & bye',
      },
    };
    // Act
    const out = expandShortcodes(markdown, spicy);
    // Assert
    expect(out).toContain('src="https://x.example/og.png?a=1&amp;b=&quot;2&quot;"');
    expect(out).toContain("<b>A &amp; B &lt;C&gt;</b>");
    expect(out).toContain("<p>say &quot;hi&quot; &amp; bye</p>");
  });

  it("when a line is a figure shortcode, replaces it with a figure element with caption", () => {
    // Arrange
    const markdown = "\\figure{/img/2020-12-18/rack.jpg}{スイッチングハブ等が置いてあるラック}\n";
    // Act
    const out = expandShortcodes(markdown, embeds);
    // Assert
    expect(out).toBe(
      '<figure><img src="/img/2020-12-18/rack.jpg" /><figcaption>スイッチングハブ等が置いてあるラック</figcaption></figure>\n',
    );
  });

  it("when text merely mentions shortcode-like syntax mid-line or in code, leaves it untouched", () => {
    // Arrange
    const markdown = "see {{ embed https://calver.org }} inline\n    \\figure{a}{b}\n";
    // Act
    const out = expandShortcodes(markdown, embeds);
    // Assert
    expect(out).toBe(markdown);
  });

  it("when a shortcode-like line sits inside a fenced code block, leaves it untouched", () => {
    // Arrange
    const markdown = "```\n{{ embed https://calver.org }}\n\\figure{a}{b}\n```\n";
    // Act
    const out = expandShortcodes(markdown, embeds);
    // Assert
    expect(out).toBe(markdown);
  });
});

describe("collectEmbedUrls", () => {
  it("when a line is an embed shortcode, collects its URL", () => {
    // Act & Assert
    expect(collectEmbedUrls("before\n{{ embed https://calver.org }}\nafter\n")).toEqual([
      "https://calver.org",
    ]);
  });

  it("when an embed-shortcode-like line sits inside a fenced code block, does not collect it", () => {
    // Act & Assert
    expect(collectEmbedUrls("```\n{{ embed https://calver.org }}\n```\n")).toEqual([]);
  });
});
