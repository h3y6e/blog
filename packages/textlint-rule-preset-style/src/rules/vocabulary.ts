import type { TxtDocumentNode } from "@textlint/ast-node-types";
import thresholds from "../../generated/thresholds.json" with { type: "json" };
import { analyze } from "../morph.ts";
import { allSentences, proseSegments } from "../prose.ts";
import { bandMessage, outside, type Rule, type RuleContext, type RuleHandlers } from "../rule.ts";

const MIN_TOKENS = 100;

const config = thresholds.vocabulary;

const ratio = (value: number): string => value.toFixed(3);

const rule: Rule = (context: RuleContext): RuleHandlers => {
  const { RuleError, report } = context;
  return {
    async Document(node: TxtDocumentNode): Promise<void> {
      const sentences = allSentences(proseSegments(node));
      const chars = sentences.reduce((sum, sentence) => sum + sentence.text.length, 0);
      // Gate on characters instead of tokens: roughly two characters per token.
      if (chars < MIN_TOKENS * 2) return;
      const record = await analyze(sentences);

      for (const [label, value, band] of [
        ["distinct bigram ratio", record.distinct2, config.distinct2],
        ["type-token ratio", record.ttrWindow, config.ttrWindow],
      ] as const) {
        const { reportable, outsideHard } = outside(value, band);
        if (!reportable) continue;
        report(node, new RuleError(bandMessage(label, ratio(value), band, ratio, outsideHard)));
      }
    },
  };
};

export default rule;
