+++
title = "Claude Code ActionでPRレビューを自動化"
date = Date(2025, 07, 02)
tags = ["github", "claude"]
rss_description = "Claude Code ActionとAWS Bedrockを使って、GitHub ActionsでPRの自動レビューシステムを構築した"
+++

## 経緯

コードレビューは開発プロセスで重要だが、時間がかかる。レビュー待ちがボトルネックになることがある。

AnthropicsがClaude Code Actionというものをベータ版で公開している。これを使えば[Claude Code](https://www.anthropic.com/claude-code)をGitHub Actionsに組み込める。

{{ embed https://github.com/anthropics/claude-code-action }}

## Claude Code Actionの仕組み

Claude Code Actionは、GitHub上でClaude Codeを動かすためのアクション。コメントやPRのイベントをトリガーにして、コードの分析や修正提案ができる。

複数のクラウドプロバイダーに対応しており、今回はAWS Bedrockを利用する。IAMロールでアクセス制御できるのが良い。

## 実装の流れ

### 基本的なワークフロー

最初に作ったのは、シンプルなレビューワークフロー

```yaml
name: claude-review

on:
  workflow_call:
    secrets:
      AWS_BEDROCK_ROLE_ARN:
        description: "AWS role ARN for Bedrock access"
        required: true

permissions:
  contents: read
  pull-requests: write
  id-token: write

jobs:
  claude-review:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    continue-on-error: true
```

Reusable workflowにして、各リポジトリから呼び出せるようにした。

Claude Code Actionの利用箇所ではAWS Bedrockを使うための設定が必要。

```yaml
- name: Run Claude Code
  uses: anthropics/claude-code-action@beta
  env:
    ANTHROPIC_BEDROCK_BASE_URL: "https://bedrock-runtime.ap-northeast-1.amazonaws.com"
  with:
    model: "apac.anthropic.claude-sonnet-4-20250514-v1:0"
    use_bedrock: true
    direct_prompt: |
      # レビュー用のプロンプト
```

環境変数 `ANTHROPIC_BEDROCK_BASE_URL` と `use_bedrock: true`、`model` を設定することで、Bedrockエンドポイントを使うようになる

### 古いコメントの最小化

PRを更新するたびに新しいコメントが増えると見づらい。そこで、古いコメントを自動で折りたたむ処理を追加した。

```bash
gh api /repos/${{ github.repository }}/issues/${{ github.event.pull_request.number }}/comments \
  --jq '.[] | select(.user.login == "claude[bot]") | .node_id' | \
while read -r node_id; do
  gh api graphql -f query='
    mutation {
      minimizeComment(input: {subjectId: "'$node_id'", classifier: OUTDATED}) {
        minimizedComment { isMinimized }
      }
    }'
done
```

GitHub GraphQL APIの `minimizeComment` を使うと、コメントを削除せずに折りたためる。履歴として残しつつ、最新のレビューだけ目立たせられる。

### プロンプト

レビューの品質を上げるために、プロンプトをカスタマイズした。

```yaml
direct_prompt: |
  Review this PR and provide feedback in Japanese with severity levels (Critical/High/Medium/Low) and code examples.
  For PRs with new commits, understand the full context first, then focus comments on the latest changes.
  NOTE: Skip CI-related checks as they're handled separately.
  IMPORTANT: Complete exclusion of positive evaluations.
```

重要度レベル（Critical/High/Medium/Low）を設定したのがポイント。これで「これはブロッカー」「これは改善提案」が一目でわかる。

新しいコミットがあるPRの場合は、まず全体のコンテキストを理解してから最新の変更にフォーカスするよう指示している。これで修正漏れのチェックが効果的に行われる。

別のCIで実行されるtestやlintについては言及しないように明記し、重複した指摘を避けている。
また、肯定的な評価を完全に除外することで、問題点の指摘に集中させている。

## トリガーイベント

### 初期 - PRイベントのみ

最初は単純にPRのopenedとsynchronizeイベントで実行していた。

```yaml
on:
  pull_request:
    types: [opened, synchronize]
```

でも、これだと毎回のpushでCIが走ってしまう。レビュー中の細かい修正のたびに実行されるのは無駄。

### 改良 - 柔軟なトリガー条件

そこで、より柔軟なトリガー条件に変更した。

```yaml
if: |
  github.event.sender.type != 'Bot' && (
    (
      github.event_name == 'issue_comment' &&
      github.event.issue.pull_request &&
      contains(github.event.comment.body, '@claude')
    ) ||
    (
      github.event_name == 'pull_request_review_comment' &&
      contains(github.event.comment.body, '@claude')
    ) ||
    (
      github.event_name == 'pull_request_review' &&
      contains(github.event.review.body, '@claude')
    ) ||
    (
      github.event_name == 'pull_request' &&
      github.event.action != 'review_requested' &&
      github.event.pull_request.draft == false
    ) ||
    (
      github.event_name == 'pull_request' &&
      github.event.action == 'review_requested' &&
      github.event.requested_team.name == 'claude'
    )
  )
```

様々なケースで動作するようになった。PRの通常コメント（`issue_comment`）、レビューコメント、レビュー本文での `@claude` メンション、`claude` チームへのレビューリクエスト、通常のPRイベント（ドラフトは除外）など。

工夫した点として、`claude[bot]` は直接レビュアーに指定できないため、`claude` というダミーチームを作成した。そのチームへのレビューリクエストでもワークフローが発火するようにした。

## 実際の導入例

実際にプロジェクトに導入してみた。Reusable workflowとして実装したので、各リポジトリから簡単に呼び出せる。

```yaml
name: claude-review

on:
  pull_request:
    types: [opened, ready_for_review, review_requested]
  pull_request_review:
    types: [submitted]
  pull_request_review_comment:
    types: [created]
  issue_comment:
    types: [created]

jobs:
  claude-review:
    uses: my-org/actions/.github/workflows/claude-review.yaml@main
    secrets:
      AWS_BEDROCK_ROLE_ARN: ${{ secrets.AWS_BEDROCK_ROLE_ARN }}
```

`uses:` で参照することで、ワークフローの本体を各リポジトリにコピーする必要がない。
PR関連のすべてのイベントに対応できるように設定して、柔軟にレビューをトリガーできるようにした。

## 使ってみた感想

### 良かったところ

実際に使ってみて、思った以上に便利だった。

導入したプロジェクトではGitHub Copilotのレビュー機能も併用しているが、決定的な違いがある。
Copilotは変更された差分のみを解析対象とするが、このworkflowは変更箇所だけでなくコードベース全体の文脈を理解した上でレビューを行う。変更が波及する可能性のある箇所まで含めて解析し、潜在的な副作用を指摘してくれる。

特に、アーキテクチャ上の暗黙的な前提や、コード間の意味的な依存関係といった、型システムでは表現できない制約についての指摘が有用。人間がdiffだけを見てレビューする際に見落としがちな、システム全体の整合性に関わる問題も検出してくれることがある。

### 課題と改善点

とはいえ、完璧ではない。

修正した箇所を見落としたり、PRのコメントで説明していることを読み飛ばしたりすることがある。逆に、コードに書いていないことを「実装されていない」と指摘してくることもある。

これらの問題は、PRが大きくなりトークン数が多くなることが原因だと考えられる。適切にコンテキストを制御できれば改善する可能性はある。

## これから

今後改善したい点がいくつかある。

ファイルパターンでスキップできれば、自動生成ファイルなどをレビュー対象から除外できる。
また、複数モデルの使い分けも検討したい。簡単なチェックは高速モデル、詳細レビューは高性能モデルといった使い分けができれば効率的だ。

Critical/Highの問題がなければ自動的にApproveする機能もあると良さそう。

## おわりに

Claude Code ActionとAWS Bedrockの組み合わせで、PRレビューの自動化ができた。

完全に人間のレビューを置き換えるものではないが、機械的なチェックを任せることで、人間はより本質的なレビューへ集中できる。
