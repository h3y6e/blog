+++
title = "Claudeによるコードレビューをフィードバックで自己改善する仕組み"
date = Date(2025, 08, 01)
tags = ["github", "claude"]
rss_description = "Claudeによるコードレビューに対する開発者のフィードバックを収集・分析し、レビュー品質を自動的に改善するワークフローを実装した"
+++

## 背景

[前回の記事](/posts/20250702-claude-code-action-pr-review/)でClaude Code Actionを使ったPRレビューの自動化について紹介した。
実際に運用してみると、Claudeのレビューコメントに対して開発者が「それは意図的な設計です」「スタイルの問題なので修正不要」といった反応をすることが増えてきた。レビューの観点が開発チームの意図とずれている。

そこで、開発者の反応を収集・分析し、レビューガイドラインを自動的に改善する仕組みを実装した。

## 実装したシステムの全体像

### アーキテクチャ

1. フィードバック収集: 週2回の定期実行で過去のPRから開発者の反応を収集
2. 分析と改善案生成: Claude自身が収集データを分析し、ガイドラインを更新
3. 自動適用: PRを作成してauto-mergeで即座に反映

### 技術スタック

- GitHub Actions（ワークフロー基盤）
- AWS Bedrock（Claude APIアクセス）
- `claude-code-base-action`（ファイル操作を含む自動化）
- GitHub Apps（auto-merge権限）

## フィードバック収集の実装

### GitHub Actionsワークフロー

週2回定期実行されるワークフローを作成した。

```yaml
name: claude-review-tuning

on:
  schedule:
    - cron: "0 2 * * 1,4"
  workflow_dispatch:

jobs:
  tune-claude-review:
    runs-on: ubuntu-latest
    steps:
      - name: Collect claude-review feedback
        run: |
          # 過去PRのコメントを収集するスクリプトを実行
          node collect-claude-feedback.ts
```

### フィードバック収集スクリプト

TypeScriptで実装した収集スクリプトが、過去のPRを分析する。

```typescript
interface FeedbackCollection {
  /** メタデータ */
  metadata: {
    /** リポジトリ名 (owner/repo形式) */
    repository: string;
    /** 収集期間 */
    dateRange: {
      from: string;
      to: string;
    };
    /** 対象PRの総数 */
    totalPRs: number;
    /** コメント総数 */
    totalComments: number;
  };
  /** 収集したPRの詳細情報 */
  pullRequests: PRWithReview[];
}

interface PRWithReview {
  /** PR番号 */
  prNumber: number;
  /** PRタイトル */
  prTitle: string;
  /** PR作成者のユーザー名 */
  prAuthor: string;
  /** マージ日時 */
  mergedAt: string;
  /** コメント一覧 */
  comments: Comment[];
  /** PR作成者の返信数 */
  authorResponseCount: number;
  /** 総やり取り回数 */
  totalInteractions: number;
}
```

スクリプトは最近のマージ済みPRから、Claudeのレビューコメントとそれに対する開発者の反応を収集する。
特に以下のパターンを重視している。

- 開発者が反論や説明をしている
- コメントに対して反応がない（＝有用でない可能性）
- 同じ指摘が繰り返されている

## レビューワークフローとの統合

### プロンプトの分離設計

実際のレビューワークフローでは、`direct_prompt` と `custom_instructions` を使い分けている。

- direct_prompt: レビューの基本仕様（言語、重要度レベル、フォーマットなど）
- custom_instructions: プロジェクト固有のガイドライン（自動更新対象）

実際の実装では、`.github/copilot-instructions.md` を読み込み、共通ワークフローの `custom_instructions` に渡している。

この設計により、レビューの形式は統一しつつ、プロジェクト固有のコンテキストは動的に更新できる。
フィードバックループで更新されるのは `custom_instructions` の部分のみで、基本的なレビュー構造は安定したまま維持される。

## ガイドライン更新の仕組み

### 分析プロセス

収集したデータは、Claude自身で分析する。`claude-code-base-action` を使用することで、分析から更新まで一気通貫で自動化している。

```yaml
- name: Analyze feedback and generate improvements
  uses: anthropics/claude-code-base-action@beta
  with:
    prompt: |
      Analyze `claude-feedback.json` to understand which review comments led to actual improvements vs were dismissed.
      
      1. Update `.github/copilot-instructions.md` (code review instructions only):
        - Learn from feedback what types of issues are most valuable to catch
        - Prioritize review focus areas based on what actually helped authors
        - Define how to communicate findings constructively
        - Avoid creating rules about when NOT to review
        - Keep all review guidelines focused on quality and helpfulness
      
      2. Update `CLAUDE.md` (project knowledge only):
        - Identify project-specific misunderstandings from feedback
        - Add new sections for important patterns not yet documented
        - Update existing sections with clearer explanations
        - Remove redundant, verbose, or less frequently needed content
        - Focus on "what the project is" not "how to review it"
```

### カスタム指示の更新

分析結果を基に、`.github/copilot-instructions.md` を自動更新する。このファイルを更新対象にしているのは、GitHub Copilotも併用しているためだ。Claudeだけでなく、Copilotのレビューにも同じガイドラインを適用することで、一貫性のあるレビュー体験を提供できる。

余談だが、CopilotによるレビューはClaude Codeによるものと比較して精度が圧倒的に低く、その低精度なレビューにClaude Codeが引きずられてしまうことがあるため、Copilotの自動レビュー機能はオフにしている。
必要に応じて手動でCopilotレビューする運用にしている。

以下は更新されるガイドラインの例

```markdown
# Code Review Guidelines

## Focus Areas
- Type safety issues (missing type annotations, any usage)
- Logic errors that affect functionality
- Security concerns (exposed credentials, SQL injection risks)
- Performance bottlenecks in critical paths

## Skip These
- Import ordering and formatting
- Variable naming preferences
- Function length unless it genuinely impacts readability
- Suggestions to use different libraries/frameworks
```

### `CLAUDE.md` の更新

`CLAUDE.md` にプロジェクト固有のコンテキストを記載しているので、ここも自動更新する。

以下は更新される内容の例

```markdown
## Project Knowledge

### Tech Stack
- Next.js 15 with App Router
- TypeScript (strict mode enabled)
- React 19 features actively used
- Connect-RPC for API communication

### Important Patterns
- Server Components preferred over Client Components
- Streaming responses for better UX
- Error boundaries at route level
```

これにより、「なぜこのコードがこうなっているか」をClaudeが理解できるようになる。

### 自動PRの作成

更新内容は自動的にPRとして作成され、auto-mergeが有効化される。PR作成時には収集期間やPR数などのメタデータも含まれる。

```bash
# PR作成スクリプト
if [[ -f "claude-feedback.json" ]]; then
  TOTAL_PRS=$(jq -r '.metadata.totalPRs' claude-feedback.json)
  TOTAL_COMMENTS=$(jq -r '.metadata.totalComments' claude-feedback.json)
  DATE_FROM=$(jq -r '.metadata.dateRange.from' claude-feedback.json)
  DATE_TO=$(jq -r '.metadata.dateRange.to' claude-feedback.json)

  PR_TITLE="ci: auto-tune review settings from ${TOTAL_PRS} PRs"
  PR_BODY=$(cat <<EOF
## Summary
- Period: ${DATE_FROM} - ${DATE_TO}
- Total PRs: ${TOTAL_PRS}
- Total comments: ${TOTAL_COMMENTS}
EOF
)
fi

# PRを作成してauto-merge
gh pr create --title "${PR_TITLE}" --body "${PR_BODY}"
gh pr merge --auto --squash
```

GitHub Apps認証を使用してPRを作成し、auto-mergeを行なっている。

## 技術的な実装詳細

### セキュリティとアクセス制御

`claude-code-base-action` では、ファイル操作の安全性を確保するため、許可されたツールを明示的に定義している。
ファイルの表示・編集・作成とgitコマンドのみを許可し、sudoやファイル削除などの危険な操作は禁止している。

### データ収集の最適化

収集スクリプトでは、`claude[bot]` を特定し、GitHub APIを使用して最近のマージ済みPRから効率的にデータを収集する。
Claudeのコメントとそれに対する開発者の反応をペアで抽出し、分析用のJSONファイルに保存する。

## 導入効果と今後の課題

### 導入効果

フィードバックに基づいてガイドラインを更新することで、より的確なレビューができるようになった。

特に「クリティカルな問題に集中する」という方針により、スタイルや設計思想に関する不要な指摘が減り、開発者にとって価値のあるレビューコメントの割合が向上した。

### 運用上の考慮点

週2回の自動実行により、継続的にレビュー品質が改善されていく。頻繁すぎない更新頻度により、ガイドラインが安定しつつも、開発者のフィードバックを着実に反映できる。

プロジェクト固有の文脈をどこまで記載するかのバランスは難しい。詳細すぎるとメンテナンスコストが高くなるため、重要な設計判断に絞って記載している。

### 予想される課題

自動更新を繰り返すうちに、プロンプトが発散していく可能性がある。フィードバックを単純に追加していくと、ガイドラインが肥大化し、本来の目的から逸脱するかもしれない。

また、開発者のフィードバックが常に正しいとは限らない。誤った指摘や矛盾したフィードバックが混入した場合、それがガイドラインに反映されてしまうリスクもある。定期的な人間によるレビューが必要だろう。

## 学びと今後の展望

### `claude-code-base-action` の活用

`claude-code-action` と比較して、`claude-code-base-action` は自由度が大きい。複雑なプロンプトや複数ファイルの操作が必要な場合に特に便利で、今回のようなタスクには最適だった。今後も積極的に活用していきたい。

### 継続的改善の重要性

AIツールの導入において、「導入して終わり」ではなく、開発者の反応やフィードバックを取り入れて継続的に改善していくことの重要性を実感した。
人間のレビュアーであれば自然に行われる「相手の反応を見て次回のレビューに活かす」というプロセスを、システムとして実装することで、AIレビューの質を向上させることができる。

このワークフローの最大の利点は、メンテナーに依存しないことだ。手動でプロンプトエンジニアリングを行い、チームの要望を吸い上げてガイドラインに反映させるのは大変な作業になる。
この仕組みなら、開発者の実際の反応から自動的に改善点を抽出し、継続的に最適化されていく。

## まとめ

Claudeのコードレビューに対する開発者のフィードバックを自動収集・分析し、レビュー品質を継続的に改善する仕組みを実装した。
定期的な自動実行により、開発者の実際の反応から学習し、より価値のあるレビューを提供できるようになった。

今後は、より短いフィードバックループの実現や、プロジェクト間でのナレッジ共有なども検討していきたい。
