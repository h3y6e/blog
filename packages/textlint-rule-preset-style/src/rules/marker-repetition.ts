import type { TxtDocumentNode } from "@textlint/ast-node-types";
import { proseSegments } from "../prose.ts";
import type { ConfiguredRule, RuleContext, RuleHandlers } from "../rule.ts";
const MAX_PER_WINDOW = 2;
const WINDOW_CHARS = 1000;

const occurrences = (segments: { text: string; offset: number }[], marker: string): number[] => {
  const hits: number[] = [];
  for (const segment of segments) {
    let from = segment.text.indexOf(marker);
    while (from !== -1) {
      hits.push(segment.offset + from);
      from = segment.text.indexOf(marker, from + marker.length);
    }
  }
  return hits;
};

/** Words the writer reaches for often. Not banned, only watched for density. */
type Options = { markers?: readonly string[] };

// Only the density within a window is a problem, so report the crowded window
// rather than each occurrence.
const rule: ConfiguredRule<Options> = (context: RuleContext, options = {}): RuleHandlers => {
  const { RuleError, report } = context;
  const markers = options.markers ?? [];
  return {
    Document(node: TxtDocumentNode): void {
      const segments = proseSegments(node);
      for (const marker of markers) {
        const hits = occurrences(segments, marker);
        let reported = -1;
        for (const start of hits) {
          const inWindow = hits.filter(
            (offset) => offset >= start && offset < start + WINDOW_CHARS,
          );
          const last = inWindow.at(-1) ?? start;
          if (inWindow.length <= MAX_PER_WINDOW || last <= reported) continue;
          reported = last;
          report(
            node,
            new RuleError(
              `「${marker}」 appears ${inWindow.length} times within ${WINDOW_CHARS} chars; keep it to ${MAX_PER_WINDOW}`,
              { index: last },
            ),
          );
        }
      }
    },
  };
};

export default rule;
