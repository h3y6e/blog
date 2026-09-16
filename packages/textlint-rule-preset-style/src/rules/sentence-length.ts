import type { TxtDocumentNode } from "@textlint/ast-node-types";
import thresholds from "../../generated/thresholds.json" with { type: "json" };
import { allSentences, proseSegments } from "../prose.ts";
import {
  bandMessage,
  outside,
  type Band,
  type Rule,
  type RuleContext,
  type RuleHandlers,
} from "../rule.ts";
import { median } from "../stats.ts";

/** Too few sentences to read a distribution from. */
const MIN_SENTENCES = 10;

const config = thresholds.sentenceLength;
const band: Band = config;

const rule: Rule = (context: RuleContext): RuleHandlers => {
  const { RuleError, report } = context;
  return {
    Document(node: TxtDocumentNode): void {
      const sentences = allSentences(proseSegments(node));
      if (sentences.length < MIN_SENTENCES) return;

      const value = median(sentences.map((sentence) => sentence.text.length));
      const { reportable, outsideHard } = outside(value, band);
      if (reportable) {
        report(
          node,
          new RuleError(
            bandMessage(
              "median sentence length",
              `${value.toFixed(1)} chars`,
              band,
              (n) => n.toFixed(0),
              outsideHard,
            ),
          ),
        );
      }

      for (const sentence of sentences) {
        const { length } = sentence.text;
        if (length <= config.maxWarn) continue;
        const limit = length > config.maxHard ? config.maxHard : config.maxWarn;
        report(
          node,
          new RuleError(`${length}-char sentence; split it past ${limit.toFixed(0)} chars`, {
            index: sentence.offset,
          }),
        );
      }
    },
  };
};

export default rule;
