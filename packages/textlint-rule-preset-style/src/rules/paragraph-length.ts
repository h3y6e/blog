import type { TxtDocumentNode } from "@textlint/ast-node-types";
import thresholds from "../../generated/thresholds.json" with { type: "json" };
import { proseSegments, splitSentences } from "../prose.ts";
import {
  bandMessage,
  outside,
  type Band,
  type Rule,
  type RuleContext,
  type RuleHandlers,
} from "../rule.ts";
import { median } from "../stats.ts";

const MIN_SENTENCES = 10;

const config = thresholds.paragraphLength;
const band: Band = config;

const rule: Rule = (context: RuleContext): RuleHandlers => {
  const { RuleError, report } = context;
  return {
    // List items count as paragraphs, matching how the thresholds were measured.
    Document(node: TxtDocumentNode): void {
      const counts = proseSegments(node)
        .map((segment, index) => splitSentences(segment, index).length)
        .filter((count) => count > 0);
      if (counts.reduce((sum, count) => sum + count, 0) < MIN_SENTENCES) return;

      const value = median(counts);
      const { reportable, outsideHard } = outside(value, band);
      if (!reportable) return;
      report(
        node,
        new RuleError(
          bandMessage(
            "median sentences per paragraph",
            value.toFixed(1),
            band,
            (n) => String(n),
            outsideHard,
          ),
        ),
      );
    },
  };
};

export default rule;
