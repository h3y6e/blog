// Zero-dependency build-time syntax highlighter emitting compact
// <span class="x"> tokens styled by site/theme/css/syntax.css. Single-letter
// classes are safe because the CSS scopes them under `pre code`:
//   k keyword   b built-in   l literal   t type      s string   c comment
//   n number    m meta       v variable  a attr/key  y symbol   h heading
//   g tag       u bullet     q quote     d code span f link     w strong
//   e emphasis
// One generic lexer, parameterized per language: at each position the first
// matching rule wins, then identifiers are classified via a keyword map, and
// everything else passes through escaped.

type Rule = {
  re: RegExp; // sticky; may use m + lookbehind for line-start anchoring
  cls?: string; // token class emitted verbatim
};

type Lang = {
  rules: Rule[];
  keywords?: Record<string, string>;
  ident?: RegExp; // sticky; default IDENT
};

const IDENT = /[A-Za-z_$][\w$]*/y;
const NUMBER = /\b0[xX][0-9a-fA-F]+\b|\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b/y;
const DQ_STRING = /"(?:\\[^]|[^"\\])*"/y;
const HASH_COMMENT = /(?<=^|\s)#[^\n]*/my;
const C_COMMENT = /\/\/[^\n]*|\/\*[^]*?\*\//y;

const keywords = (groups: Record<string, string>): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const [cls, words] of Object.entries(groups)) for (const w of words.split(" ")) map[w] = cls;
  return map;
};

const bash: Lang = {
  rules: [
    { re: /^#![^\n]*/my, cls: "m" },
    { re: DQ_STRING, cls: "s" },
    { re: /'[^']*'/y, cls: "s" },
    { re: HASH_COMMENT, cls: "c" },
    { re: /\$\{[^}\n]*\}|\$[\w@#?*$!-]+/y, cls: "v" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({
    k:
      "if then else elif fi for while until do done case esac function in select " +
      "local export return source set unset shift trap readonly alias",
    b: "echo printf read cd pwd eval exec test",
    l: "true false",
  }),
};

const yaml: Lang = {
  rules: [
    // Block scalar body: lines after "key: |" sharing the first line's indent.
    {
      re: /(?<=[|>][ \t]*\n)(?:[ \t]*\n)*([ \t]+)[^\n]*(?:\n(?:[ \t]*(?=\n|$)|\1[^\n]*))*/my,
      cls: "s",
    },
    { re: DQ_STRING, cls: "s" },
    { re: /'[^'\n]*'/y, cls: "s" },
    { re: HASH_COMMENT, cls: "c" },
    { re: /^---$/my, cls: "m" },
    { re: /(?<=^[ \t]*(?:- +)?)[^\s:#]+(?=:(?:[ \t]|$))/my, cls: "a" },
    { re: /(?<=^[ \t]*)-(?=[ \t]|$)/my, cls: "u" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({ l: "true false null" }),
};

const julia: Lang = {
  rules: [
    { re: /"""[^]*?"""|"(?:\\[^]|[^"\\])*"/y, cls: "s" },
    { re: /#=[^]*?=#|#[^\n]*/y, cls: "c" },
    { re: /@\w+!?/y, cls: "m" },
    { re: /(?<=^|[\s(=,[]):[A-Za-z_]\w*/my, cls: "y" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({
    k:
      "function end if else elseif for while begin let using import export return " +
      "break continue do module macro struct mutable try catch finally quote local " +
      "global const where in isa abstract primitive type baremodule",
    l: "true false nothing missing NaN Inf",
    b:
      "println print push! pop! length rand zeros ones sum prod map filter " +
      "setdiff abs abs2 sqrt versioninfo",
  }),
  ident: /[A-Za-z_]\w*!?/y,
};

const cxx: Lang = {
  rules: [
    { re: C_COMMENT, cls: "c" },
    { re: /(?<=^[ \t]*)#[ \t]*\w[^\n]*/my, cls: "m" },
    { re: DQ_STRING, cls: "s" },
    { re: /'(?:\\.|[^'\\])'/y, cls: "s" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({
    k:
      "if else for while do return break continue switch case default struct class " +
      "enum union typedef static const constexpr inline public private protected " +
      "virtual override new delete namespace using template typename this operator " +
      "sizeof extern volatile goto try catch throw friend mutable explicit",
    t:
      "int char float double long short bool void auto unsigned signed size_t " +
      "int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t",
    l: "true false nullptr NULL",
  }),
};

const markdown: Lang = {
  rules: [
    { re: /^#{1,6}[ \t][^\n]*/my, cls: "h" },
    { re: /^>[^\n]*/my, cls: "q" },
    { re: /(?<=^[ \t]*)(?:[-*+]|\d+\.)(?=[ \t])/my, cls: "u" },
    { re: /`[^`\n]+`/y, cls: "d" },
    { re: /!?\[[^\]\n]*\]\([^)\n]*\)/y, cls: "f" },
    { re: /\*\*[^\n]+?\*\*|__[^\n]+?__/y, cls: "w" },
    { re: /\*[^*\n]+\*|\b_[^_\n]+_\b/y, cls: "e" },
  ],
};

const toml: Lang = {
  rules: [
    { re: /(?<=^|\s)[#;][^\n]*/my, cls: "c" },
    { re: /(?<=^[ \t]*)\[[^\]\n]*\]/my, cls: "h" },
    { re: /(?<=^[ \t]*)[\w.-]+(?=[ \t]*=)/my, cls: "a" },
    { re: DQ_STRING, cls: "s" },
    { re: /'[^'\n]*'/y, cls: "s" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({ l: "true false" }),
};

const ts: Lang = {
  rules: [
    { re: C_COMMENT, cls: "c" },
    { re: /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\[^]|[^`\\])*`/y, cls: "s" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({
    k:
      "const let var function return if else for while do switch case default " +
      "class extends implements import export from new async await typeof " +
      "instanceof of in delete void yield static get set try catch finally throw " +
      "this super type interface enum namespace declare readonly public private " +
      "protected as satisfies keyof infer break continue",
    l: "true false null undefined NaN Infinity",
    b:
      "console JSON Math Promise Object Array String Number Boolean Map Set " +
      "Symbol window document fetch",
  }),
};

const json: Lang = {
  rules: [
    { re: /"(?:\\.|[^"\\\n])*"(?=[ \t]*:)/y, cls: "a" },
    { re: /"(?:\\.|[^"\\\n])*"/y, cls: "s" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({ l: "true false null" }),
};

const html: Lang = {
  rules: [
    { re: /<!--[^]*?-->/y, cls: "c" },
    { re: /<![^>\n]*>/y, cls: "m" },
    { re: /<\/?[a-zA-Z][\w-]*|\/?>/y, cls: "g" },
    { re: /[a-zA-Z][\w-]*(?==)/y, cls: "a" },
    { re: /(?<==)"[^"\n]*"|(?<==)'[^'\n]*'/y, cls: "s" },
  ],
};

const vim: Lang = {
  rules: [
    { re: /(?<=^[ \t]*)"[^\n]*/my, cls: "c" },
    { re: /'[^'\n]*'|"[^"\n]*"/y, cls: "s" },
    { re: /\$\w+|\b[gbwtvls]:\w+/y, cls: "v" },
    { re: NUMBER, cls: "n" },
  ],
  keywords: keywords({
    k:
      "set let map nmap nnoremap inoremap vnoremap cnoremap imap vmap cmap source " +
      "call function endfunction if else elseif endif for endfor while endwhile " +
      "return autocmd augroup end syntax filetype colorscheme execute echo command finish",
  }),
};

const LANGS: Record<string, Lang> = { bash, yaml, julia, cxx, markdown, toml, ts, json, html, vim };

const ALIASES: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  c: "cxx",
  cpp: "cxx",
  "c++": "cxx",
  md: "markdown",
  ini: "toml",
  typescript: "ts",
  js: "ts",
  javascript: "ts",
  xml: "html",
  vimscript: "vim",
};

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Splits at newlines so no emitted span ever crosses a line boundary
// (withLineNumbers relies on this).
const span = (text: string, cls?: string): string =>
  text
    .split("\n")
    .map((t) => (t && cls ? `<span class="${cls}">${esc(t)}</span>` : esc(t)))
    .join("\n");

/**
 * Returns token markup for `code`. Unknown or empty `lang`
 * yields the escaped code unchanged.
 */
export function highlight(code: string, lang: string): string {
  const name = lang.toLowerCase();
  const def = LANGS[ALIASES[name] ?? name];
  if (!def) return esc(code);
  const ident = def.ident ?? IDENT;
  let out = "";
  let i = 0;
  outer: for (let ch = code[i]; ch !== undefined; ch = code[i]) {
    for (const { re, cls } of def.rules) {
      re.lastIndex = i;
      const m = re.exec(code);
      if (m?.[0]) {
        out += span(m[0], cls);
        i += m[0].length;
        continue outer;
      }
    }
    ident.lastIndex = i;
    const m = ident.exec(code);
    if (m?.[0]) {
      out += span(m[0], def.keywords?.[m[0]]);
      i += m[0].length;
    } else {
      out += esc(ch);
      i++;
    }
  }
  return out;
}

/**
 * Wraps each line in a numbered span for the CSS-counter line-number column.
 * `markup` must not contain tags crossing newlines (highlight() guarantees this).
 */
export const withLineNumbers = (markup: string): string =>
  markup
    .split("\n")
    .map((line) => `<span class="ln">${line}</span>`)
    .join("\n");
