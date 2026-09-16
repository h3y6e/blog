import { tokenize, type KuromojiToken } from "kuromojin";
import type { Sentence } from "./prose.ts";

export type SentenceEndForm =
  | "desu_masu"
  | "da_dearu"
  | "jotai_verb"
  | "jotai_adj"
  | "taigen"
  | "question"
  | "other";

const PLACEHOLDER = "識別子";
const SKIP_POS = new Set(["記号", "補助記号", "空白", "フィラー", "その他"]);
// Sentences ending on a particle (「〜まで。」) count as noun-stopped too.
const TAIGEN_POS = new Set(["名詞", "接頭詞", "助詞", "連体詞"]);

const TRAILING = /[。．.、，,！？!?」』）)】\s]+$/u;
const DESU_MASU = /(です|ます|でしょう|ましょう|ません|でした|ました)$/u;
const DA_DEARU = /(だ|である|であった|だった)$/u;

export const contentTokens = (tokens: readonly KuromojiToken[]): KuromojiToken[] =>
  tokens.filter((token) => !SKIP_POS.has(token.pos) && token.surface_form !== PLACEHOLDER);

// Surface patterns run before the POS check: kuromoji only sometimes splits
// です・ます off as a separate auxiliary.
export const classifyEnd = (text: string, tokens: readonly KuromojiToken[]): SentenceEndForm => {
  const stripped = text.replace(/[」』）)】\s]+$/u, "");
  const body = text.replace(TRAILING, "");
  if (body === "") return "other";
  if (/[？?]$/u.test(stripped) || body.endsWith("か")) return "question";
  if (DESU_MASU.test(body)) return "desu_masu";
  if (DA_DEARU.test(body)) return "da_dearu";

  const final = contentTokens(tokens).at(-1);
  if (final === undefined) return "other";
  if (final.pos === "助動詞") {
    if (final.basic_form === "です" || final.basic_form === "ます") return "desu_masu";
    if (final.basic_form === "だ") return "da_dearu";
    return "jotai_verb";
  }
  if (final.pos === "動詞") return "jotai_verb";
  if (final.pos === "形容詞") return "jotai_adj";
  if (TAIGEN_POS.has(final.pos)) return "taigen";
  return "other";
};

export type MorphRecord = {
  formRatio: Map<SentenceEndForm, number>;
  maxConsecutive: number;
  /** Index of the first sentence in the longest same-ending run. */
  maxConsecutiveAt: number;
  distinct2: number;
  ttrWindow: number;
};

const TTR_WINDOW = 100;
const TTR_STEP = 50;

const meanWindowTtr = (surfaces: string[]): number => {
  if (surfaces.length === 0) return 0;
  if (surfaces.length <= TTR_WINDOW) return new Set(surfaces).size / surfaces.length;
  const ratios: number[] = [];
  for (let i = 0; i + TTR_WINDOW <= surfaces.length; i += TTR_STEP) {
    const window = surfaces.slice(i, i + TTR_WINDOW);
    ratios.push(new Set(window).size / window.length);
  }
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
};

export const analyze = async (sentences: Sentence[]): Promise<MorphRecord> => {
  const tokenized = await Promise.all(sentences.map((sentence) => tokenize(sentence.text)));
  const forms = sentences.map((sentence, index) =>
    classifyEnd(sentence.text, tokenized[index] ?? []),
  );

  const counts = new Map<SentenceEndForm, number>();
  for (const form of forms) counts.set(form, (counts.get(form) ?? 0) + 1);
  const formRatio = new Map<SentenceEndForm, number>();
  for (const [form, count] of counts) formRatio.set(form, count / forms.length);

  let best = forms.length === 0 ? 0 : 1;
  let bestAt = 0;
  let run = 1;
  let runAt = 0;
  for (let i = 1; i < forms.length; i += 1) {
    if (forms[i] === forms[i - 1]) {
      run += 1;
    } else {
      run = 1;
      runAt = i;
    }
    if (run > best) {
      best = run;
      bestAt = runAt;
    }
  }

  const surfaces = tokenized
    .flatMap((tokens) => contentTokens(tokens))
    .map((token) => token.surface_form);
  const bigrams = surfaces.slice(0, -1).map((surface, i) => `${surface}|${surfaces[i + 1]}`);
  return {
    formRatio,
    maxConsecutive: best,
    maxConsecutiveAt: bestAt,
    distinct2: bigrams.length === 0 ? 0 : new Set(bigrams).size / bigrams.length,
    ttrWindow: meanWindowTtr(surfaces),
  };
};
