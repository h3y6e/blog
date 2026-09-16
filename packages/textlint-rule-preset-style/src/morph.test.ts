import { tokenize } from "kuromojin";
import { describe, expect, it } from "vite-plus/test";
import { analyze, classifyEnd } from "./morph.ts";

const sentence = (text: string): { text: string; segment: number; offset: number } => ({
  text,
  segment: 0,
  offset: 0,
});

describe("classifyEnd", () => {
  it.each([
    ["a です・ます ending is desu_masu", "これは設定ファイルです。", "desu_masu"],
    ["a plain verb ending is jotai_verb", "設定ファイルを置く。", "jotai_verb"],
    ["a plain adjective ending is jotai_adj", "この方が速い。", "jotai_adj"],
    ["a noun ending is taigen", "以上が今回の変更点。", "taigen"],
    ["a である ending is da_dearu", "これは既知の問題である。", "da_dearu"],
    ["a question mark ending is question", "どこに置くべきか？", "question"],
  ])("%s", async (_name, text, expected) => {
    // Arrange
    const tokens = await tokenize(text);

    // Act
    const form = classifyEnd(text, tokens);

    // Assert
    expect(form).toBe(expected);
  });
});

describe("analyze", () => {
  it("when sentences repeat an ending, reports the run length and where it starts", async () => {
    // Arrange
    const sentences = ["設定を書く。", "反映する。", "確認する。", "これは設定です。"].map(
      sentence,
    );

    // Act
    const record = await analyze(sentences);

    // Assert
    expect(record.maxConsecutive).toBe(3);
    expect(record.maxConsecutiveAt).toBe(0);
    expect(record.formRatio.get("desu_masu")).toBeCloseTo(0.25);
  });
});
