import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { proseSegments } from "../prose.ts";
import type { ConfiguredRule, RuleContext, RuleHandlers } from "../rule.ts";
/** Shortest verbatim run worth reporting. */
const MATCH_CHARS = 25;
const STOPLIST = [/https?:\/\/\S+/g];
const CORPUS_DIR = "site/posts";

const normalize = (markdown: string): string => {
  let text = markdown
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "");
  for (const pattern of STOPLIST) text = text.replace(pattern, "");
  return text.replace(/\s+/g, "");
};

// ngram -> first post it came from. Built once; the corpus does not change mid-run.
let corpus: Map<string, string> | null = null;

const loadCorpus = (dir: string, n: number): Map<string, string> => {
  if (corpus !== null) return corpus;
  const grams = new Map<string, string>();
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || entry.name !== "index.md") continue;
    const path = join(entry.parentPath, entry.name);
    const name = relative(dir, path);
    const text = normalize(readFileSync(path, "utf8"));
    for (let i = 0; i + n <= text.length; i += 1) {
      const gram = text.slice(i, i + n);
      if (!grams.has(gram)) grams.set(gram, name);
    }
  }
  corpus = grams;
  return grams;
};

/** Phrases repeated across posts on purpose. */
type Options = { allow?: readonly string[] };

/** Catches sentences carried over verbatim when a past post is used as a draft. */
const rule: ConfiguredRule<Options> = (context: RuleContext, options = {}): RuleHandlers => {
  const { RuleError, report, getFilePath } = context;
  const allow = options.allow ?? [];
  const dir = resolve(CORPUS_DIR);
  const n = MATCH_CHARS;
  return {
    Document(node: TxtDocumentNode): void {
      const filePath = getFilePath();
      const self = filePath === undefined ? null : relative(dir, filePath);
      const grams = loadCorpus(dir, n);
      for (const segment of proseSegments(node)) {
        const text = normalize(segment.text);
        const seen = new Set<string>();
        for (let i = 0; i + n <= text.length; i += 1) {
          const gram = text.slice(i, i + n);
          const source = grams.get(gram);
          if (source === undefined || source === self || seen.has(source)) continue;
          if (allow.some((phrase) => gram.includes(phrase))) continue;
          seen.add(source);
          report(
            node,
            new RuleError(`${n}+ chars match ${source}: 「${gram}」`, { index: segment.offset }),
          );
        }
      }
    },
  };
};

export default rule;
