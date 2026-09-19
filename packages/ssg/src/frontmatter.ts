export type Frontmatter = {
  title: string;
  date: string;
  type: string;
  tags: string[];
  rss_description: string;
  cover?: string;
  aliases?: string[];
};

const STRING_KEYS = new Set(["title", "type", "rss_description", "cover"]);
const LIST_KEYS = new Set(["tags", "aliases"]);

function parseScalar(value: string, key: string): string {
  const quoted = value.match(/^"(.*)"$/s) ?? value.match(/^'(.*)'$/s);
  const inner = quoted?.[1];
  if (inner !== undefined) return inner;
  if (value === "" || value.includes('"') || value.includes("'"))
    throw new Error(`frontmatter: unparseable value for ${key}: ${value}`);
  return value;
}

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
    if (LIST_KEYS.has(key)) {
      if (value.startsWith("[") && value.endsWith("]")) {
        data[key] = parseInlineList(value, key);
      } else if (value === "") {
        const items: string[] = [];
        for (
          let next: string | undefined;
          (next = lines[i + 1]) !== undefined && /^\s*-\s/.test(next);
          i++
        ) {
          items.push(parseScalar(next.replace(/^\s*-\s*/, ""), key));
        }
        data[key] = items;
      } else {
        throw new Error(`frontmatter: ${key} must be a list: ${value}`);
      }
      if (key === "aliases") {
        for (const alias of data[key]) {
          if (!/^\/.*\/$/.test(alias))
            throw new Error(`frontmatter: alias must be a page path like /posts/x/: ${alias}`);
        }
      }
    } else if (key === "date") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
        throw new Error(`frontmatter: date must be YYYY-MM-DD: ${value}`);
      data.date = value;
    } else if (STRING_KEYS.has(key)) {
      data[key] = parseScalar(value, key);
    } else {
      throw new Error(`frontmatter: unknown key: ${key}`);
    }
  }

  for (const required of ["title", "date", "type", "tags", "rss_description"]) {
    if (!(required in data)) throw new Error(`frontmatter: missing key: ${required}`);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion, typescript/consistent-type-assertions
  return { frontmatter: data as unknown as Frontmatter, body };
}
