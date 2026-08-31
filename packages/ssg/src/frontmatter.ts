/**
 * Minimal YAML-subset parser for post frontmatter.
 * Supported keys: title, rss_description, cover (strings), date (ISO date),
 * tags (inline `[a, b]` or `- item` list). Anything else throws.
 */

export type Frontmatter = {
  title: string;
  date: string;
  tags: string[];
  rss_description: string;
  cover?: string;
};

const STRING_KEYS = new Set(["title", "rss_description", "cover"]);

function parseScalar(value: string, key: string): string {
  const quoted = value.match(/^"(.*)"$/s) ?? value.match(/^'(.*)'$/s);
  const inner = quoted?.[1];
  if (inner !== undefined) return inner;
  if (value === "" || value.includes('"') || value.includes("'"))
    throw new Error(`frontmatter: unparseable value for ${key}: ${value}`);
  return value;
}

/** Splits a comma-separated list, respecting '...'/"..." quoted items so a
 * comma inside a quoted item doesn't end it early. */
function splitList(inner: string): string[] {
  const items: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (const ch of inner) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === ",") {
      items.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  items.push(cur);
  return items;
}

function parseInlineList(value: string, key: string): string[] {
  const inner = value.slice(1, -1).trim();
  if (inner === "") return [];
  return splitList(inner).map((item) => parseScalar(item.trim(), key));
}

export function parseFrontmatter(source: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = source.match(/^---\n(.*?)\n---\n/s);
  if (!match) throw new Error("frontmatter: missing --- block");
  const body = source.slice(match[0].length);
  // Both capture groups always participate in a successful match.
  const lines = match[1]!.split("\n").filter((l) => l.trim() !== "");

  const data: Record<string, string | string[]> = {};
  let i = 0;
  let line: string | undefined;
  for (; (line = lines[i]) !== undefined; i++) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) throw new Error(`frontmatter: unparseable line: ${line}`);
    const key = kv[1]!;
    const value = kv[2]!;
    if (Object.hasOwn(data, key)) throw new Error(`frontmatter: duplicate key: ${key}`);
    if (key === "tags") {
      if (value.startsWith("[") && value.endsWith("]")) {
        data.tags = parseInlineList(value, key);
      } else if (value === "") {
        const items: string[] = [];
        for (
          let next: string | undefined;
          (next = lines[i + 1]) !== undefined && /^\s*-\s/.test(next);
          i++
        ) {
          items.push(parseScalar(next.replace(/^\s*-\s*/, ""), key));
        }
        data.tags = items;
      } else {
        throw new Error(`frontmatter: tags must be a list: ${value}`);
      }
    } else if (key === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error(`frontmatter: date must be YYYY-MM-DD: ${value}`);
      data.date = value;
    } else if (STRING_KEYS.has(key)) {
      const scalar = parseScalar(value, key);
      // cover feeds og:image as `${site.siteUrl}${cover}`; it must be a
      // root-relative path, not already absolute, or the concatenation
      // produces a malformed URL.
      if (key === "cover" && !scalar.startsWith("/")) {
        throw new Error(
          `frontmatter: cover must be a root-relative path starting with /: ${scalar}`,
        );
      }
      data[key] = scalar;
    } else {
      throw new Error(`frontmatter: unknown key: ${key}`);
    }
  }

  for (const required of ["title", "date", "tags", "rss_description"]) {
    if (!(required in data)) throw new Error(`frontmatter: missing key: ${required}`);
  }
  // The presence checks above are the runtime validation; the shape is now Frontmatter.
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, typescript/consistent-type-assertions
  return { frontmatter: data as unknown as Frontmatter, body };
}
