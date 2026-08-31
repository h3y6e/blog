// Zero-dependency TeX → MathML Core converter.
// Supports only the subset used by the blog posts; any other command throws.

type Tok = { cmd: boolean; v: string };

const GREEK: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  infty: "∞",
};

const OPS: Record<string, string> = {
  times: "×",
  cdot: "⋅",
  pm: "±",
  mp: "∓",
  div: "÷",
  approx: "≈",
  neq: "≠",
  ne: "≠",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  in: "∈",
  cup: "∪",
  cap: "∩",
  ldots: "…",
  dots: "…",
  cdots: "⋯",
};

const BIG: Record<string, string> = { sum: "∑", prod: "∏" };

const SPACE: Record<string, string> = {
  ",": "0.167em",
  ";": "0.278em",
  " ": "0.25em",
  quad: "1em",
  qquad: "2em",
};

const DELIM: Record<string, string> = {
  "(": "(",
  ")": ")",
  "[": "[",
  "]": "]",
  "|": "|",
  "{": "{",
  "}": "}",
  lceil: "⌈",
  rceil: "⌉",
  lfloor: "⌊",
  rfloor: "⌋",
  langle: "⟨",
  rangle: "⟩",
  ".": "",
};

const CH_OP = new Set("+-=<>*,;:!?.%/");
const CH_FENCE = new Set("()[]|");

const esc = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

function tokenize(tex: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  let c: string | undefined;
  while ((c = tex[i]) !== undefined) {
    if (/\s/.test(c)) {
      for (let w: string | undefined; (w = tex[i]) !== undefined && /\s/.test(w);) i++;
      toks.push({ cmd: false, v: " " });
    } else if (c === "\\") {
      const m = /^[a-zA-Z]+/.exec(tex.slice(i + 1));
      const v = m ? m[0] : tex[i + 1];
      if (v === undefined) throw new Error("Trailing backslash");
      toks.push({ cmd: true, v });
      i += 1 + v.length;
    } else {
      toks.push({ cmd: false, v: c });
      i++;
    }
  }
  return toks;
}

const row = (parts: string[]): string => {
  const joined = parts.join("");
  return parts.length === 1 ? joined : `<mrow>${joined}</mrow>`;
};

class Parser {
  private i = 0;
  private toks: Tok[];
  constructor(toks: Tok[]) {
    this.toks = toks;
  }

  /** Next significant token, skipping whitespace. */
  private peek(): Tok | undefined {
    let t: Tok | undefined;
    while ((t = this.toks[this.i]) !== undefined && t.v === " " && !t.cmd) this.i++;
    return t;
  }

  private next(): Tok {
    const t = this.peek();
    if (!t) throw new Error("Unexpected end of input");
    this.i++;
    return t;
  }

  expectEnd(): void {
    const t = this.peek();
    if (t) throw new Error(`Unexpected ${t.cmd ? "\\" : ""}${t.v}`);
  }

  parseSequence(): string[] {
    const parts: string[] = [];
    for (let t = this.peek(); t; t = this.peek()) {
      if ((t.cmd && t.v === "right") || (!t.cmd && t.v === "}")) break;
      parts.push(this.parseScripted());
    }
    return parts;
  }

  private parseScripted(): string {
    const [base, limits] = this.parseAtom();
    let sub: string | undefined, sup: string | undefined;
    for (let t = this.peek(); t && !t.cmd && (t.v === "_" || t.v === "^"); t = this.peek()) {
      this.i++;
      if (t.v === "_") {
        if (sub) throw new Error("Double subscript");
        sub = this.parseArg();
      } else {
        if (sup) throw new Error("Double superscript");
        sup = this.parseArg();
      }
    }
    if (!sub && !sup) return base;
    if (limits) {
      if (sub && sup) return `<munderover>${base}${sub}${sup}</munderover>`;
      return sub ? `<munder>${base}${sub}</munder>` : `<mover>${base}${sup}</mover>`;
    }
    if (sub && sup) return `<msubsup>${base}${sub}${sup}</msubsup>`;
    return sub ? `<msub>${base}${sub}</msub>` : `<msup>${base}${sup}</msup>`;
  }

  private parseArg(): string {
    return this.parseAtom()[0];
  }

  private parseGroupBody(): string {
    const parts = this.parseSequence();
    const t = this.toks[this.i++];
    if (!t || t.cmd || t.v !== "}") throw new Error("Missing }");
    return row(parts);
  }

  private rawCh(j: number): string {
    const t = this.toks[j];
    return t && !t.cmd ? t.v : "";
  }

  /** Consumes tokens up to (not including) the next real `}` as plain text.
   * An escaped `\}` (cmd token whose value is "}") is a literal brace
   * character, not the group's closing delimiter, so it's consumed too. */
  private takeText(): string {
    let s = "";
    for (
      let t: Tok | undefined;
      (t = this.toks[this.i]) !== undefined && (t.cmd || t.v !== "}");
      this.i++
    )
      s += t.v;
    return s;
  }

  /** Collects the next {...} group (or the rest of the current group) as plain text. */
  private parseText(): string {
    const t = this.peek();
    let s: string;
    if (t && !t.cmd && t.v === "{") {
      this.i++;
      s = this.takeText();
      this.i++;
    } else {
      s = this.takeText();
    }
    return `<mtext>${esc(s.trim())}</mtext>`;
  }

  private delim(t: Tok): string {
    if (t.cmd && t.v === "|") return "‖";
    const d = DELIM[t.v];
    if (d === undefined) throw new Error(`Unsupported delimiter: ${t.cmd ? "\\" : ""}${t.v}`);
    return d;
  }

  private parseAtom(): [string, boolean?] {
    const t = this.next();
    const v = t.v;
    if (!t.cmd) {
      if (/[0-9]/.test(v)) {
        let n = v;
        for (let c = this.rawCh(this.i); c; c = this.rawCh(this.i)) {
          if (!/[0-9]/.test(c) && !(c === "." && /[0-9]/.test(this.rawCh(this.i + 1)))) break;
          n += c;
          this.i++;
        }
        return [`<mn>${n}</mn>`];
      }
      if (/[a-zA-Z]/.test(v)) return [`<mi>${v}</mi>`];
      if (v === "{") return [this.parseGroupBody()];
      if (CH_FENCE.has(v)) return [`<mo stretchy="false">${esc(v)}</mo>`];
      if (CH_OP.has(v)) return [`<mo>${esc(v)}</mo>`];
      throw new Error(`Unexpected character: ${v}`);
    }
    if (GREEK[v]) return [`<mi>${GREEK[v]}</mi>`];
    if (OPS[v]) return [`<mo>${OPS[v]}</mo>`];
    if (BIG[v]) return [`<mo movablelimits="true">${BIG[v]}</mo>`, true];
    if (SPACE[v]) return [`<mspace width="${SPACE[v]}"></mspace>`];
    if (v === "frac") return [`<mfrac>${this.parseArg()}${this.parseArg()}</mfrac>`];
    if (v === "sqrt") return [`<msqrt>${this.parseArg()}</msqrt>`];
    if (v === "hat") return [`<mover>${this.parseArg()}<mo stretchy="false">^</mo></mover>`];
    if (v === "text" || v === "rm" || v === "mathrm") return [this.parseText()];
    if (v === "left") {
      const open = this.delim(this.next());
      const body = this.parseSequence().join("");
      const r = this.next();
      if (!(r.cmd && r.v === "right")) throw new Error("Missing \\right");
      const close = this.delim(this.next());
      const mo = (d: string): string => (d ? `<mo>${esc(d)}</mo>` : "");
      return [`<mrow>${mo(open)}${body}${mo(close)}</mrow>`];
    }
    if (v === "{" || v === "}") return [`<mo stretchy="false">${esc(v)}</mo>`];
    if (v === "|") return [`<mo>‖</mo>`];
    if (v === "%") return [`<mo>%</mo>`];
    throw new Error(`Unsupported TeX command: \\${v}`);
  }
}

export function texToMathML(tex: string, display: boolean): string {
  const p = new Parser(tokenize(tex));
  const body = p.parseSequence().join("");
  p.expectEnd();
  const attr = display ? ' display="block"' : "";
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"${attr}>${body}</math>`;
}
