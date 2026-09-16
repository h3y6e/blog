// Thresholds live in generated/thresholds.json, produced by `vp run calibrate-style`
// from site/posts.
import markerRepetition from "./rules/marker-repetition.ts";
import paragraphLength from "./rules/paragraph-length.ts";
import scriptRatio from "./rules/script-ratio.ts";
import selfCopy from "./rules/self-copy.ts";
import sentenceEnd from "./rules/sentence-end.ts";
import sentenceLength from "./rules/sentence-length.ts";
import vocabulary from "./rules/vocabulary.ts";

const WARNING = { severity: "warning" };

// textlint reads a preset as a default-exported { rules, rulesConfig }.
export default {
  rules: {
    "sentence-length": sentenceLength,
    "paragraph-length": paragraphLength,
    "script-ratio": scriptRatio,
    "marker-repetition": markerRepetition,
    "self-copy": selfCopy,
    "sentence-end": sentenceEnd,
    vocabulary,
  },
  // The rules report distances from what has been written, not mistakes, so they
  // default to warnings. A .textlintrc entry replaces these defaults outright.
  rulesConfig: {
    "sentence-length": WARNING,
    "paragraph-length": WARNING,
    "script-ratio": WARNING,
    "marker-repetition": WARNING,
    "self-copy": WARNING,
    "sentence-end": WARNING,
    vocabulary: WARNING,
  },
};
