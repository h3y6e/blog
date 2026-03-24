+++
title = "ClaudeによるコードレビューをAgent Skillsで育てる"
date = Date(2026, 3, 24)
tags = ["github", "claude"]
rss_description = "Claudeレビューの自己改善ループをAgent Skills中心に再設計し、自動レビューと対話モードで同じ知識を共有するようにした"
+++

## 背景

[前回の記事](/posts/20250801-claude-review-feedback-tuning/)では、Claudeのレビューに対する開発者の反応を収集し、`.github/copilot-instructions.md` と `CLAUDE.md` を自動更新する仕組みを紹介した。

この仕組み自体は、いまは所属チームの複数プロダクトでかなり広く使っている。
GitHub Copilotなど既存の自動レビューよりも品質が圧倒的に高く、指摘の妥当性やコンテキスト理解の面で差がある。実際、リポジトリ次第では人間がほとんどレビューしておらず、Claudeとのやり取りを中心とした運用になっている。

その後、実際に運用している `claude-review.yaml` と `claude-review-tuning.yaml` は大きく変わった。
現在はpromptを直接育てるのではなく、[Agent Skills](https://agentskills.io)を中心に据える構成である。
自動レビューと、専用メンションによる対話が、同じ知識源を参照するようになっている。

主な変更点は以下の3つ。

- チューニング対象がskillファイルに変わった
- `claude-review` が自動レビューだけでなく、PR上での対話や修正依頼の入口にもなった
- contextをむやみに増やさず、最小限のskillに責務を分ける方向に変わった

前回の記事の末尾では、「`direct_prompt` と `custom_instructions` が `prompt` に統合されたら工夫が必要そう」と書いていたが、知識や判断基準をskillへ分離する形に進んだため、この懸念はかなり薄くなっている。

## 以前の構成で課題だったこと

前回の構成でも、レビュー品質を継続的に改善するという目的は達成できていた。
ただ、運用していくと次の点が気になってきた。

- レビュー基準とプロジェクト固有知識の責務がprompt周辺ファイルに分散していて見通しが悪い
- 自動レビューで学習した内容を、PR上での追加質問や修正依頼でも同じように使いたい
- 自動更新の差分が「長い指示文の変更」になりやすく、人間がレビューしづらい

特に効いていたのは2つ目だった。
レビューコメントを付ける場面だけでなく、開発者が専用メンションでClaudeと会話しながら「この指摘の意図は何か」「そのまま修正してほしい」とやり取りする場面でも、同じ判断基準と同じプロジェクト知識を参照してほしかったためだ。

## 役割ごとにskillを分けた

現在の `claude-review` は、以下の2つのskillを読む前提になっている。

- `.agents/skills/code-review-guidelines/SKILL.md`
- `.agents/skills/project-knowledge/SKILL.md`

それぞれの役割は明確に分けている。

- `code-review-guidelines`: プロジェクト非依存のレビュー基準。何を指摘し、何を指摘しないか
- `project-knowledge`: そのリポジトリ固有の事実。構成、境界、制約、慣習など

`code-review-guidelines` には自動更新用のマーカーを入れている。

```markdown
# Code Review Guidelines

<!-- claude-review-tuning -->

<!-- /claude-review-tuning -->
```

人間が手で書く長期的な方針はこのマーカーの外に置き、自動チューニングはマーカー内だけを書き換える。
これにより、「人間が決めた原則」と「最近のフィードバックから学んだ調整」を同じファイルに共存させやすくなった。

## 自動レビューと対話モードが同じskillを読む

現在の `claude-review` は、自動レビュー用と対話用の2経路を1つのreusable workflowにまとめている。

自動レビュー側では、promptの中でskillを読むように明示している。

```yaml
prompt: |
  ...
  If the skills "code-review-guidelines" and "project-knowledge" are available, load them before starting the review.
claude_args: >-
  --allowedTools "...,Skill(code-review-guidelines),Skill(project-knowledge),..."
```

PR作成や更新時にはこちらが動作する。
トップレベルの要約コメントは必ず残し、具体的な問題はinline commentで返す。
一方で `git add` / `git commit` / `git push` は禁止しており、あくまでレビュアーとして振る舞わせている。

対話モードは、たとえば `@claude` のような専用メンションで起動する。

```yaml
trigger_phrase: "@claude"
--append-system-prompt "Only modify or edit code when the user explicitly requests a fix, change, or implementation."
```

ポイントは、レビューの再確認や説明依頼であればcomment-onlyのまま応答し、明示的に修正を依頼されたときだけコード変更に入るように分けられていることだ。

つまり現在の `claude-review` は、

- 通常時は自動でレビューする
- 必要になったら同じPR上で会話できる
- 明示的に依頼されたときだけ修正もさせられる

という1本の入口になっている。

## tuningもskillだけを更新する

`claude-review-tuning` の役割も変わった。
前回は `.github/copilot-instructions.md` や `CLAUDE.md` を更新していたが、現在はskillファイルだけを更新する。

流れは次の通り。

1. `collect.ts` が前回のtuning PR以降にマージされたPRを収集する
2. bot作成のPRは除外し、ClaudeとPR authorのコメントだけを時系列で並べる
3. `sync-skills.sh` で `.agents/skills` の体裁を揃える
4. Claudeがskillを更新するPRを作り、自動マージする

収集スクリプトが前回のtuning PR以降だけを見るようになっているため、毎回「最近の運用で実際に起きたこと」だけを材料にできる。
毎回のチューニングが、直近の運用変化に追従しやすくなった。

更新前には `sync-skills.sh` を必ず通している。
これにより、`.agents/skills/<name>/SKILL.md` を正規形に保ちつつ、`.claude/skills` 側からも参照できる状態を維持できる。

実際のtuning promptでは、skill間の責務分離をかなり強く縛っている。

```yaml
Goal: tune two skills with strict separation of concerns.

Global constraints:
- Do NOT modify YAML frontmatter
- Each file must not exceed 150 lines
- Do not duplicate the same point across files
- If evidence is weak or one-off, do not add a new rule/fact
```

その上で、

- `code-review-guidelines` にはproject-agnosticな判断基準だけを書く
- `project-knowledge` にはrepository-specificな安定した事実だけを書く

と明示している。
これで、レビュー基準とリポジトリ固有知識が混ざりにくくなった。

ここで、promptやrepository contextを自動的に太らせないのは意図的である。
[Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?](https://arxiv.org/abs/2602.11988) では、リポジトリ向けのcontextは推論コストを20%以上増やすと報告されている。
その結果、タスク成功率をむしろ下げる傾向があるという。

この結論は、自分たちの運用で見えていたことともよく一致している。以前はレビュー基準とプロジェクト知識をまとめて増やしていくと、重要ではない指摘や、チームとして意図している設計へのコメントが混ざりやすくなった。

だからこそ現在のtuningでは、何でもかんでも知識を足すのではなく、繰り返し効いたルールを `code-review-guidelines` へ寄せている。
リポジトリ固有で安定した事実は `project-knowledge` に集約している。
前回のようにprompt本体を自動改善し続けるより、最小限だけをskillとして保つ方が安全だと考えている。

## 現在の構成の良いところ

まず、何を調整しているのかが前より見えやすくなった。
以前はレビュー方針の変更もリポジトリ知識の追加も、どちらも「指示文の更新」に見えていた。
現在はレビュー基準の調整なのか、プロジェクト知識の追加なのかを分けて読める。

また、自動レビューと対話モードが同じ知識を読むため、定期tuningが形骸化しにくくなった。
レビュー時に学んだことが、PR上の説明や修正依頼でもそのまま使われる。

チューニング差分の意味も追いやすくなった。
`.github/copilot-instructions.md` のような長い指示文より、`code-review-guidelines` と `project-knowledge` という責務の見えるファイルの方が、何を調整したのかを把握しやすい。

運用ルールも前より説明しやすくなった。
自動レビューではまずコメント中心、対話モードでは必要なときだけ修正へ進む、という役割分担にしている。
細かい権限設計は自分たちの運用前提で割り切っている部分もあるが、少なくともどう振る舞ってほしいかは前より書き分けやすくなっている。

## おわり

前回の記事では、「Claudeレビューをフィードバックで自己改善するループ」を作った話を書いた。
今回のフォローアップで書きたかったのは、レビューを継続改善するときにはpromptを育て続けるより、最小限のskillへ責務を分離した方が運用しやすい、という点である。

しばらく回してみても、この方向の方がレビューの継続改善を日常運用に乗せやすいと感じている。
一方で、どこまでを `project-knowledge` に書かせるか、どのくらいの頻度でtuningするか、といったバランスはまだ試行錯誤中だ。
今後は、リポジトリごとの差を吸収しつつ、最小限のcontextでどこまでレビュー品質を維持できるかを引き続き見ていけたらと思う。
