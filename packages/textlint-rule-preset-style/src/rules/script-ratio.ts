import type { TxtDocumentNode } from "@textlint/ast-node-types";
import thresholds from "../../generated/thresholds.json" with { type: "json" };
import { proseChars, proseSegments } from "../prose.ts";
import { bandMessage, outside, type Rule, type RuleContext, type RuleHandlers } from "../rule.ts";

/** Shorter prose swings the ratios too much to judge. */
const MIN_CHARS = 300;

const config = thresholds.scriptRatio;

const SCRIPTS = [
  { key: "hiragana", label: "hiragana", band: config.ranges.hiragana },
  { key: "kanji", label: "kanji", band: config.ranges.kanji },
  { key: "katakana", label: "katakana", band: config.ranges.katakana },
  { key: "latin", label: "latin", band: config.ranges.latin },
] as const;

type Script = (typeof SCRIPTS)[number]["key"];

const scriptOf = (ch: string): Script | null => {
  if (/\p{Script=Hiragana}/u.test(ch)) return "hiragana";
  if (/\p{Script=Han}/u.test(ch)) return "kanji";
  if (/[\p{Script=Katakana}ー]/u.test(ch)) return "katakana";
  if (/\p{Script=Latin}/u.test(ch)) return "latin";
  return null;
};

const percent = (ratio: number): string => `${(ratio * 100).toFixed(1)}%`;

const rule: Rule = (context: RuleContext): RuleHandlers => {
  const { RuleError, report } = context;
  return {
    Document(node: TxtDocumentNode): void {
      const chars = proseChars(proseSegments(node));
      if (chars.length < MIN_CHARS) return;

      const counts = new Map<Script, number>();
      for (const ch of chars) {
        const script = scriptOf(ch);
        if (script !== null) counts.set(script, (counts.get(script) ?? 0) + 1);
      }
      for (const script of SCRIPTS) {
        const ratio = (counts.get(script.key) ?? 0) / chars.length;
        const { reportable, outsideHard } = outside(ratio, script.band);
        if (!reportable) continue;
        report(
          node,
          new RuleError(
            bandMessage(`${script.label} share`, percent(ratio), script.band, percent, outsideHard),
          ),
        );
      }
    },
  };
};

export default rule;
