/** HTML tagged template with auto-escaping. Wrap trusted markup in `raw()`. */

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(s: string): string {
  // The regex matches exactly the keys of ESCAPES.
  return s.replace(/[&<>"']/g, (c) => ESCAPES[c]!);
}

/** Marks a string as already-safe HTML. `html\`\`` returns Raw, so nesting composes. */
export class Raw {
  readonly html: string;
  constructor(markup: string) {
    this.html = markup;
  }
  toString(): string {
    return this.html;
  }
}

export function raw(markup: string): Raw {
  return new Raw(markup);
}

export type Value = string | number | boolean | null | undefined | Raw | Value[];

function render(v: Value): string {
  if (v == null || typeof v === "boolean") return "";
  if (v instanceof Raw) return v.html;
  if (Array.isArray(v)) return v.map(render).join("");
  return escapeHtml(String(v));
}

export function html(strings: TemplateStringsArray, ...values: Value[]): Raw {
  return new Raw(strings.reduce((out, s, i) => out + render(values[i - 1]) + s));
}
