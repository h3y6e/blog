import type { TxtDocumentNode } from "@textlint/ast-node-types";
import thresholds from "../../generated/thresholds.json" with { type: "json" };
import { analyze, type SentenceEndForm } from "../morph.ts";
import { allSentences, proseSegments } from "../prose.ts";
import {
  bandMessage,
  outside,
  type Band,
  type Rule,
  type RuleContext,
  type RuleHandlers,
} from "../rule.ts";

const MIN_SENTENCES = 10;

const config = thresholds.sentenceEnd;

// taigen and jotai_verb are left out. Noun-stopped counts swallow list items and
// reference lines, and verb-stopped is just the remainder of the other two.
const LABELS = [
  { key: "desu_masu", label: "です・ます" },
  { key: "da_dearu", label: "だ・である" },
  { key: "jotai_adj", label: "plain adjective" },
  { key: "question", label: "question" },
] as const satisfies readonly { key: SentenceEndForm; label: string }[];

const percent = (ratio: number): string => `${(ratio * 100).toFixed(1)}%`;

// Choosing a register is the writer's call; this only checks the spread inside
// whichever register the draft is already in.
const rule: Rule = (context: RuleContext): RuleHandlers => {
  const { RuleError, report } = context;
  return {
    async Document(node: TxtDocumentNode): Promise<void> {
      const sentences = allSentences(proseSegments(node));
      if (sentences.length < MIN_SENTENCES) return;
      const record = await analyze(sentences);

      const polite = (record.formRatio.get("desu_masu") ?? 0) >= config.politeThreshold;
      const register = polite ? config.register.polite : config.register.plain;
      const registerName = polite ? "polite" : "plain";

      for (const { key, label } of LABELS) {
        const band: Band = register.forms[key];
        const ratio = record.formRatio.get(key) ?? 0;
        const { reportable, outsideHard } = outside(ratio, band);
        if (!reportable) continue;
        report(
          node,
          new RuleError(
            bandMessage(
              `${label} endings in a ${registerName} post`,
              percent(ratio),
              band,
              percent,
              outsideHard,
            ),
          ),
        );
      }

      if (record.maxConsecutive > config.maxConsecutiveWarn) {
        const limit =
          record.maxConsecutive > config.maxConsecutiveHard
            ? config.maxConsecutiveHard
            : config.maxConsecutiveWarn;
        report(
          node,
          new RuleError(
            `${record.maxConsecutive} sentences in a row end the same way; keep it to ${limit}`,
            { index: sentences[record.maxConsecutiveAt]?.offset ?? 0 },
          ),
        );
      }
    },
  };
};

export default rule;
