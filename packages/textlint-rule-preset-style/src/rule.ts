import type { TextlintRuleContext, TextlintRuleReportHandler } from "@textlint/types";

export type RuleContext = Readonly<TextlintRuleContext>;
export type RuleHandlers = TextlintRuleReportHandler;
export type Rule = (context: RuleContext) => RuleHandlers;

/** Author- or repository-specific word lists come from .textlintrc.json, not from code. */
export type ConfiguredRule<T extends object> = (context: RuleContext, options?: T) => RuleHandlers;

export type Band = { warnMin: number; warnMax: number; hardMin: number; hardMax: number };

// Only the warn band decides whether to report. For metrics centred near zero the
// minimum warn width can make warn wider than hard, so checking hard first would
// report values that sit inside warn.
export const outside = (
  value: number,
  band: Band,
): { reportable: boolean; outsideHard: boolean } => {
  const reportable = value < band.warnMin || value > band.warnMax;
  return { reportable, outsideHard: reportable && (value < band.hardMin || value > band.hardMax) };
};

export const bandMessage = (
  label: string,
  value: string,
  band: Band,
  format: (n: number) => string,
  outsideHard: boolean,
): string =>
  outsideHard
    ? `${label} is ${value}, outside everything written so far (${format(band.hardMin)}–${format(band.hardMax)})`
    : `${label} is ${value}, usually ${format(band.warnMin)}–${format(band.warnMax)}`;
