---
title: "LLM Wikiを日々の開発に組み込む"
date: 2026-09-17
aliases: ["/posts/20260917-building-wiki-skill/"]
tags: ["wiki", "okf", "agentskills"]
rss_description: "一次情報からエージェントがwikiを編纂して維持するための運用ルールを、building-wikiというAgent Skillにまとめた"
---

## 作ったもの

[`building-wiki`](https://github.com/h3y6e/agent-skills/blob/main/skills/building-wiki/SKILL.md) は、リポジトリの `docs/` を知識ベースとして立ち上げ、運用するためのAgent Skillである。一次情報を人間が渡し、ページの編纂と保守はエージェントが担う。

```
┌──────────────┐
│   sources    │
└───────┬──────┘
        │ Ingest
        ▼
┌──────────────┐        ┌──────────────┐
│     wiki     │◀───────│    schema    │
└───────┬──────┘        └──────────────┘
        │
        ├── Query ──▶ answer
        │
        └── Lint ───▶ findings
```

## きっかけ

アプリストアのレポートを取り込むプロジェクトで、まず何が取得できるのかを調べる必要があった。ストアごとに取得経路が何本もあり、経路ごとに保持期間、必要な権限、制約が違う。

やや厄介なのは、ドキュメントの記述と実際の挙動の食い違い。形式も時期によって変わるので、古い記述をそのまま使ってしまう危険もある。確かめるには本番のレポートやバケットに触れる必要があり、それなりの権限が要るので、実際に触るまではどうしても推測が混じる。

確認できた事実と推測を、ページの中で区別して残す必要があった。

調査結果は溜まっていったが、どこに何を置くかも、どこまでを出典と認めるかも、その場任せになっていた。そのままでは規約が揺れるので、Agent Skillとして固定した。

## 土台にしたパターン

### LLM Wiki

[LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) は、Andrej Karpathy氏が提案した、LLMにMarkdown形式のwikiを書かせて維持させるデザインパターンである。

構成は3つの層に分かれる。人間が選定して直接は書き換えない一次情報、LLMが生成・更新するwiki、そしてwikiの構造と記述ルールを定義したschema。

RAGとの違いは、情報を抽出するタイミングにある。RAGは質問された時点で素材から情報を引くが、LLM Wikiでは事前にLLMが素材を統合し、相互参照の付いたページ群として保持しておく。

Karpathy氏はこれを「永続的で、複利的に価値が積み上がる成果物」と呼んでいる（"the wiki is a persistent, compounding artifact"）。「LLMがプログラマーであり、wikiがコードベースである」という例えも使っている（"the LLM is the programmer; the wiki is the codebase"）。

基本操作はIngest、Query、Lintの3つ。Ingestは新しい素材を追加して関連ページをまとめて更新し、Queryはwikiを参照して質問に答え、Lintは矛盾・陳腐化・孤立したページを検知する。全体の索引として `index.md` を、操作履歴として `log.md` を配置する。

日本語の先行事例としては、jxck氏がTC39の議論を追うためにLLM Wikiを活用した記事がある。

{{ embed https://blog.jxck.io/entries/2026-06-29/tc39-llm-wiki.html }}

### OKF

表現形式には [OKF（Open Knowledge Format）](https://github.com/GoogleCloudPlatform/open-knowledge-format) を採用した。LLM Wikiの後にGoogle Cloudが公開した、ナレッジをYAML frontmatter付きのMarkdownで表すベンダー中立のフォーマットで、bundleと呼ぶディレクトリ単位で集約する。

必須キーは `type` だけ。Gitで管理できるので、差分確認やレビューがそのまま使える。

## 仕様として未定義な部分

Karpathy氏が定義しているのは、3つの層と3つの操作、そして `index.md` と `log.md` を置くことまで。schemaの具体的な中身までは規定されていない。ページの型、フォルダ構成、1ページあたりの粒度、一次情報として認める範囲は、ドメインごとの判断に委ねられている。

OKFも、`type` の値を一覧で管理する仕組みは持たないと明記している。どんな型を立てるかは、ここでもドメインに委ねられている。どちらの設計も、意図的に未定義の部分を残している。

skillがやっているのは、この空欄を埋めることである。

## ルールを定義する上で考慮した条件

1. 一次情報が外部にあり、流動的であること  
   ベンダーの公式ドキュメント、打ち合わせメモ、他部署からの要求仕様、API仕様などが一次情報であり、こちらの都合とは無関係に変更される。また、ベンダーごとに同一概念を異なる名称で呼ぶことも珍しくない。
2. 実装がwikiの下流に位置すること  
   コードを書く前に、「何が正解なのか」を整理・決定する必要があった。つまり、まずwikiが存在し、コードはその後に記述される。
3. 主な読み手が、タスクごとに実行されるAIエージェントであること  
   人間が読むこともあるが、日常的に参照するのは `AGENTS.md` を渡されてタスクを開始するAIエージェントになる。

この前提条件が変われば、自ずと最適なルールも変わってくる。

## あえて固定しなかったこと

ページの型やフォルダ構成は固定していない。固定するのは出力形式だけで、どんな型を立てるかはドメインに任せた。

運用しているbundleを並べても、共通しているフォルダは無い。ゼロから作ったものは互いに揃わず、もともと決定や計画の置き場があったものはその構造を残している。

型を固定しない代わりに、lintスクリプトが各型のフィールドを既存のページ群から推論する。

## 定義したルール

### 出典の境界

wikiを置いたリポジトリ自身のコードとPull Requestは、出典として扱わない。wikiは実装の上流にあるので、コードを出典にすると、wikiがコードの妥当性を追認して説明するだけの文書になってしまう。

PRを出典にすると、同じ事実がissueにもあって出典が二重になるか、実装の経緯しか書かれていないかのどちらかになる。PRにしか一次情報がない場合は、issueにコメントとして記録し直してから出典にする。

wikiが書くのは、コードのあるべき姿。食い違いが見つかった場合はコード側の不具合として扱う。

出典が述べたことと、そこから導いた推論も分ける。footnoteに書くのは出典が述べたことだけで、複数の出典をまたいで導いた結論は地の文に推論として書く。出典が答えていない問いは、埋めずにページ上で未解決のまま残す。

### GitHub Pagesでの公開

bundleの閲覧にはGitHub Pagesを使っている。Pages自体は任意の静的サイトを置けるが、標準のJekyllビルドに任せれば、ワークフローを書かずに `docs/` をそのまま配信できる。

Pagesのソースディレクトリを `/docs` にして、skillが用意している設定ファイルとレイアウトをコピーすれば終わる。索引を `index.md` ではなく `README.md` にしているのは、Jekyllのプラグインが `README.md` をトップページとして扱える点と、GitHubのWeb UIでもそのまま読める点からだ。

GitHub Enterpriseなら、privateやinternalのリポジトリから公開するPagesのアクセス範囲を、組織のメンバーだけに制限できる。限定公開で運用するなら、公開する前にこの設定を確認する。

取得可能なデータをまとめたページは、そのデータの利用者向けに使い方を案内する文書を書くときにも参照された。取り込み仕様のために調べた内容が、そのまま説明としても役に立っている。

### CONTEXT

bundleの `README.md` では、概要の直後に `## CONTEXT` セクションを設けている。用語集の役割を果たすが、網羅的な辞書を目指すものではない。

対象にするのは、すでに複数の名称で呼ばれている用語と、一般的な定義よりも狭い意味で使っている用語だけ。表記揺れを防ぐため、避けるべき呼び名とその理由も併記する。

```markdown
**Databricks Unity AI Gateway**:
Unity Catalogのガバナンス下でモデル呼び出しを中継するDatabricksの製品。
_Avoid_: Databricks AI Gateway（Model Serving側のレガシーAI Gatewayと区別できない）、Mosaic AI Gateway（レガシー側の旧称）
```

ベンダーによる改名、レガシー製品との名称重複、打ち合わせでの俗称が交錯する環境では、用語の不一致そのものが設計ミスの原因になる。

逆に、正式な製品名、一次情報で明確に定義されている語、表記揺れのない語は記載しない。CONTEXTが空であることも正常な状態として認めている。

### 一次情報が変わったときの操作

一次情報が外部で変わるので、Ingest / Query / LintにUpdateを追加した。変更を確認して `log.md` に記録してから、Ingestへ進む。

`raw/` はミラー専用。取得元のものをそのまま置き、エージェントが内容を編集することはない。

許可の出たミラーはコミットする。コミットしてあれば、ページの記述を取得元のデータと後から突き合わせられるからだ。許可の出ないものは `.gitignore` で除く。

### schemaの記述量

schemaは `AGENTS.md` の中の1ブロックに集約する。wikiのディレクトリを対象にした `<important if>` を使い、1項目1行で書く。

`AGENTS.md` は毎タスク読み込まれるので、skill側に書ける一般的な内容は重複させない。実際の記述例は次のとおり。

```markdown
<important if="you are reading or writing anything under `docs/`">
- `docs/` is a wiki; use the building-wiki skill.
- Page types: `Index`, `Concept`, `Observation`.
- An `Observation` records what was measured on a date against something outside this repository; its filename starts with that date.
</important>
```

行を追加する基準は、同じ失敗や勘違いが繰り返し起きたかどうか。単発のミスなら該当ページ側を修正して対応し、制約として機能しなくなった行は削除する。

一次情報の一覧はここに書かない。`raw/`、`sources[].resource`、`log.md` にあるからだ。リンクの記述スタイルや本文の言語指定のように、ページを見れば推論できる共通ルールも書かない。lintに委ねる。

## SDDやAI-DLCとの違い

[Spec Kit](https://github.com/github/spec-kit) のspec-driven developmentや [AI-DLC](https://aws.amazon.com/blogs/devops/open-sourcing-adaptive-workflows-for-ai-driven-development-life-cycle-ai-dlc/)、Claude Codeの `/plan` が規定するのは、開発プロセスのライフサイクル。仕様から計画、タスク、実装へ進む順序と、そのあいだの承認を定める。

LLM Wikiが規定するのは、知識のライフサイクル。工程を持たず、Ingest、Query、Lint、Updateという文書への操作だけを定める。どの順にコードを書くかには触れない。

もう1つの違いは、同じ場所に並ぶものの範囲にある。ベンダーのAPI仕様のような外部の事実と、自分たちのADRや計画が、同じ形式で並んで相互にリンクする。どのページも `sources[]` を持つので、決定についても、どのissueの要求とどの制約からそう決めたのかを後から辿れる。

ページがコードのあるべき姿を述べる点は、specと重なる。違うのは、その記述が工程に属さず、出典と一致しているかどうかだけで正しさが決まることだ。

## 向いていないユースケース

原文のまま検索したい場合は、RAGや全文検索が適している。wikiがその置き換えになるわけではない。

一次情報が単一で、一度の要約で完結する場合は、以降の蓄積が発生しないのでwiki化する意味がない。
