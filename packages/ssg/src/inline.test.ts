import { describe, expect, it } from "vite-plus/test";
import { inlineAssets } from "./inline.ts";

const page =
  "<head>" +
  '<link rel="stylesheet" href="/css/a5ebec.css" />' +
  '<script src="/libs/theme/scripts/vt.js"></script>' +
  "</head><body>" +
  '<script type="module" src="/libs/theme/scripts/switcher.js"></script>' +
  "</body>";

describe("inlineAssets", () => {
  it("when given bundled css and script code, replaces the external references inline preserving each tag form", () => {
    // Act
    const out = inlineAssets(page, "body{color:red}$&", [
      ["/libs/theme/scripts/switcher.js", 'console.log("s$&")'],
      ["/libs/theme/scripts/vt.js", 'console.log("v")'],
    ]);
    // Assert ($& in content must stay literal; vt stays classic, switcher stays module)
    expect(out).toBe(
      "<head><style>body{color:red}$&</style>" +
        '<script>console.log("v")</script>' +
        "</head><body>" +
        '<script type="module">console.log("s$&")</script>' +
        "</body>",
    );
  });

  it("when the page lacks the stylesheet link or a script tag, inlining throws", () => {
    // Act & Assert
    expect(() => inlineAssets("<head></head>", "css", [])).toThrow("stylesheet");
    expect(() => inlineAssets(page, "css", [["/libs/theme/scripts/gone.js", "x"]])).toThrow(
      "/libs/theme/scripts/gone.js",
    );
  });

  it("when inlined code would terminate its own tag early, inlining throws", () => {
    // Act & Assert
    expect(() => inlineAssets(page, "a{}</style>", [])).toThrow("</style>");
    expect(() =>
      inlineAssets(page, "css", [["/libs/theme/scripts/switcher.js", 'x="</script>"']]),
    ).toThrow("</script>");
  });
});
