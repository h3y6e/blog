import { describe, expect, it } from "vite-plus/test";
import { texToMathML } from "./index.ts";

// Minimal well-formedness check: balanced tags, no stray < > or bare & in text.
function assertWellFormed(xml: string): void {
  const stack: string[] = [];
  const tag = /<(\/?)([a-z]+)((?:\s+[a-z:="./\w-]+)*)\s*(\/?)>/g;
  let last = 0;
  for (let m = tag.exec(xml); m; m = tag.exec(xml)) {
    const text = xml.slice(last, m.index);
    expect(text).not.toMatch(/[<>]/);
    expect(text).not.toMatch(/&(?!(amp|lt|gt|#x?[0-9a-fA-F]+);)/);
    last = tag.lastIndex;
    if (m[4]) continue;
    if (m[1]) expect(stack.pop()).toBe(m[2]);
    else stack.push(m[2]!); // group 2 participates in any match
  }
  expect(xml.slice(last)).toBe("");
  expect(stack).toEqual([]);
}

// Every math expression appearing in posts/*.md.
const corpusInline = [
  "70\\%",
  "50\\%",
  "20\\%",
  "0\\%",
  "1/4096\\approx0.02\\%",
  "n",
  "A",
  "n \\times n",
  "\\lambda_i(A)",
  "i",
  "v_{i,j}",
  "v_i",
  "j",
  "M_j",
];

const corpusDisplay = [
  "\\left\\lceil \\frac{35}{2} \\right\\rceil \\times 255 = 4590\\ {\\rm steps}",
  "|v_{i,j}|^2 \\prod_{k = 1; k \\neq i}^n{(\\lambda_i(A) - \\lambda_k(A))} = \\prod_{k = 1}^{n-1}{(\\lambda_i(A) - \\lambda_k(M_j))}",
  "\\frac{1200}{1440} \\times \\frac{336\\,\\rm{mm}}{324\\,\\rm{mm}} = 0.864...",
  "\\frac{1440}{1200} \\times \\frac{324\\,\\rm{mm}}{336\\,\\rm{mm}} = 1.157...",
  "IRM: h_d(I;\\Theta_d) \\to \\left\\{ \\hat{A}, \\hat{N}, \\hat{L} \\right\\}",
  "Direct Renderer: f_d( \\hat{A}, \\hat{N}, \\hat{L}) \\to \\hat{I_d}",
  "RAR: f_r(I, \\hat{A}, \\hat{N}; \\Theta_r) \\to \\hat{I_r}",
  "L_u = ||I - (\\hat{I_d}+\\hat{I_r})||_{1}",
];

describe("corpus", () => {
  for (const tex of corpusInline) {
    it(`when the inline corpus expression ${JSON.stringify(tex)} is converted, well-formed MathML is produced`, () => {
      // Act
      const xml = texToMathML(tex, false);
      // Assert
      assertWellFormed(xml);
      expect(xml).toMatch(/^<math [^>]*>.*<\/math>$/);
      expect(xml).not.toContain('display="block"');
    });
  }
  for (const tex of corpusDisplay) {
    it(`when the display corpus expression ${JSON.stringify(tex)} is converted, well-formed block MathML is produced`, () => {
      // Act
      const xml = texToMathML(tex, true);
      // Assert
      assertWellFormed(xml);
      expect(xml).toContain('display="block"');
    });
  }
});

describe("grammar", () => {
  it("when a single variable is given, it renders as an mi element", () => {
    expect(texToMathML("x", false)).toBe(
      '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>x</mi></math>',
    );
  });

  it("when a decimal number is given, it renders as a single mn element", () => {
    expect(texToMathML("0.02", false)).toContain("<mn>0.02</mn>");
  });

  it("when trailing dots follow a number, the dots render as separate mo elements", () => {
    expect(texToMathML("0.864...", false)).toContain(
      "<mn>0.864</mn><mo>.</mo><mo>.</mo><mo>.</mo>",
    );
  });

  it("when a Greek letter command is given, it renders as an mi element with the Unicode character", () => {
    expect(texToMathML("\\lambda", false)).toContain("<mi>λ</mi>");
  });

  it("when both _{...} and ^{...} follow a base, an msubsup element is produced", () => {
    expect(texToMathML("x_{i,j}^{2}", false)).toContain(
      "<msubsup><mi>x</mi><mrow><mi>i</mi><mo>,</mo><mi>j</mi></mrow><mn>2</mn></msubsup>",
    );
  });

  it("when \\frac is given, an mfrac element with two arguments is produced", () => {
    expect(texToMathML("\\frac{35}{2}", false)).toContain("<mfrac><mn>35</mn><mn>2</mn></mfrac>");
  });

  it("when \\prod carries lower and upper limits, an munderover element is produced", () => {
    expect(texToMathML("\\prod_{k=1}^n", true)).toContain(
      '<munderover><mo movablelimits="true">∏</mo>',
    );
  });

  it("when \\hat wraps an identifier, an mover element with a hat accent is produced", () => {
    expect(texToMathML("\\hat{A}", false)).toContain(
      '<mover><mi>A</mi><mo stretchy="false">^</mo></mover>',
    );
  });

  it("when {\\rm steps} is given, an mtext element is produced", () => {
    expect(texToMathML("{\\rm steps}", false)).toContain("<mtext>steps</mtext>");
  });

  it("when \\rm{mm} is given, an mtext element is produced", () => {
    expect(texToMathML("\\rm{mm}", false)).toContain("<mtext>mm</mtext>");
  });

  it("when \\text contains an escaped brace, it renders as a literal } instead of ending the group early", () => {
    expect(texToMathML("\\text{a \\} b}", false)).toContain("<mtext>a } b</mtext>");
  });

  it("when \\left\\lceil and \\right\\rceil enclose a body, stretchy ceiling delimiters wrap it in an mrow", () => {
    expect(texToMathML("\\left\\lceil x \\right\\rceil", false)).toContain(
      "<mrow><mo>⌈</mo><mi>x</mi><mo>⌉</mo></mrow>",
    );
  });

  it("when a < character is given, it is escaped in the output", () => {
    expect(texToMathML("a < b", false)).toContain("<mo>&lt;</mo>");
  });

  it("when display is true, the math element carries display=block", () => {
    expect(texToMathML("x", true)).toContain(
      '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">',
    );
  });
});

describe("errors", () => {
  it("when an unsupported command is used, an Error naming the command is thrown", () => {
    expect(() => texToMathML("\\mathbb{R}", false)).toThrow("Unsupported TeX command: \\mathbb");
  });

  it("when a double subscript is given, an Error is thrown", () => {
    expect(() => texToMathML("x_1_2", false)).toThrow("Double subscript");
  });

  it("when a group is left unclosed, an Error is thrown", () => {
    expect(() => texToMathML("{x", false)).toThrow();
  });

  it("when a stray closing brace appears, an Error is thrown", () => {
    expect(() => texToMathML("x}", false)).toThrow();
  });
});
