+++
title = "gh-awでProjectの手入れをGitHub Actionsに乗せる"
date = Date(2026, 4, 27)
tags = ["github", "copilot", "gh-aw"]
rss_description = "Markdown workflowでProjectの空欄を安全に埋める"
+++

## Projectの空欄

GitHub Projectsにissueを集める運用は便利である。複数リポジトリに散らばった作業を、ひとまず1つのProjectで見られる。

ただ、issueを集めるだけだと、Priority、Size、Statusなどのフィールドがすぐ空になる。人間が毎回埋めるには細かすぎるし、放っておくとProjectが単なる一覧になる。

ここは特定のProjectだけの問題ではないと思う。Projectをタスク管理の中心に置くと、同じような手入れが発生する。

そこで、Project上の既存itemを定期的に見て、未設定のフィールドだけを埋めるworkflowを作った。

対象はProject運用の穴埋めである。新しい管理方法を作るのではなく、今あるProjectを保守する。

- Projectにあるitemだけを見る
- PriorityとSizeが空ならissue本文から推定して埋める
- Statusは会話やlinked PRを見て前進方向にだけ更新する
- Start date / Target dateは本文に明記があるときだけ埋める
- issueへのコメント投稿や、Projectへの新規追加はしない

## Markdown workflow

[GitHub Agentic Workflows](https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/) は、名前だけ見ると大きな仕組みに見える。

{{ embed https://github.blog/changelog/2026-02-13-github-agentic-workflows-are-now-in-technical-preview/ }}

でも、使う側から見ると、やっていることはもっと小さい。

`.github/workflows/` にfrontmatter付きのMarkdownを置く。`gh aw compile` を実行する。すると通常のGitHub Actions workflowである `.lock.yml` が生成される。

公式docsでも、`gh aw compile` はMarkdown workflowからGitHub Actionsの `.lock.yml` を生成する処理として説明されている。

{{ embed https://github.github.com/gh-aw/reference/compilation-process/ }}

Projectの手入れも、このMarkdown workflowとして書いた。

```markdown
---
on:
  schedule:
    - cron: daily
  workflow_dispatch:

github-app:
  app-id: ${{ vars.APP_ID }}
  private-key: ${{ secrets.APP_PRIVATE_KEY }}
  owner: <org>
  repositories:
    - <control-repo>
    - <target-repo>

permissions:
  contents: read
  issues: read
  pull-requests: read
  organization-projects: read

tools:
  github:
    toolsets: [default, projects]
    min-integrity: none

safe-outputs:
  update-project:
    project: https://github.com/orgs/<org>/projects/<number>
    max: 100
    allowed-repos:
      - <org>/<target-repo>
---

# Issue Triage

Auto-triage existing items only in the project.

1. Fetch all project items.
2. If project items cannot be fetched, stop.
3. Read issue details and comments as needed.
4. Update only fields that need changing.
```

frontmatter側には、いつ動くか、どのGitHub Appを使うか、どのpermissionが必要か、どのGitHub toolsを使えるか、どのsafe outputを許可するかを書く。

本文側には、agentに読ませる手順や制約を書く。

それをcompileすると、activation、agent、detection、safe outputs、conclusionなどのjobを持つGitHub Actions workflowになる。実行ログを見ても、普通にGitHub Actionsとして動いている。成功したrunでは、agent jobがissueとProjectを読んだあと、safe outputs jobが `update_project` を処理していた。

つまり、gh-awを入れるというより、「Markdownで書いた運用手順をGitHub Actionsに変換して、AIが必要な判断部分だけを担当する」くらいに捉える方が実態に近い。

これはProject triageに限らない。issueの整理、古いPRの確認、labelの見直し、定期的な棚卸しなど、GitHub上で繰り返している小さな運用作業に向いている。

## 認証の分離

gh-awはCopilot専用の仕組みではない。Copilot、Claude、Codexなど複数のengineを選べる。さらに、Markdownを `.lock.yml` にcompileすること自体は、単なるworkflow生成である。

なので、「gh-awを使う」ということと「Copilotを使う」ということは分けて考えた方がよい。gh-awのMarkdownを書いてcompileするだけなら、Copilotのpremium requestは消費しないし、Copilotの利用そのものでもない。

デフォルトのCopilot engineでworkflowを実行する場合は、別の認証が必要になる。

公式の認証docsでは、Copilot engineには `COPILOT_GITHUB_TOKEN` が必要で、これはCopilot Requests permissionを持つfine-grained PATだと書かれている。また、GitHub AppやOAuth tokenはこのsecretには使えない。

{{ embed https://github.github.com/gh-aw/reference/auth/ }}

ここで認証を二層に分けた。

Projectやissueを読む、safe outputでProjectを更新する、といったGitHub側の操作はGitHub Appでできる。実際、workflowのfrontmatterには `github-app:` を置き、App tokenをmintして使う形にした。

一方で、Copilot CLIを動かすための認証はGitHub Appでは代替できない。個人アカウントのPATが必要になる。Copilotの推論は個人のCopilot権利に紐づき、その人のpremium requestを消費するためである。

- GitHubのAPI操作: GitHub Appでよい。むしろAppの方がscopeと失効が扱いやすい
- Copilot engineの実行: 現状は個人PATが必要。GitHub Appでは置き換えられない

workflowを組むときは、`APP_ID` / `APP_PRIVATE_KEY` と `COPILOT_GITHUB_TOKEN` を別物として扱う必要がある。

## 停止条件

最初の実装では、単に「Projectのitemを見て必要なフィールドを更新する」くらいの指示だった。

しかし運用してみると、Project itemを取得できなかったときに、agentが別の方法でissue一覧を見に行き、未登録issueに対して `update_project` を呼ぼうとすることがあった。`update_project` は未登録issueをProjectに追加してしまう。

そこでworkflow本文に停止条件を入れた。

この書き方は、Agent Skillsの [`writing-skills`](https://github.com/h3y6e/dotfiles/blob/main/dot_agents/exact_skills/writing-skills/SKILL.md) にある `Create Red Flags List` を流用している。元のskillでは、agentがルールを破りそうな兆候を `Red Flags` として列挙し、見つけたら止まる形にしている。今回も同じで、Project外のissueを拾いに行きそうな条件を先に書いた。

```markdown
## Red Flags - STOP and return `noop`

- `projects_list` returned an error or empty result -> STOP. Do NOT fall back to listing issues.
- You are about to call `update_project` for an issue not present in the project item list -> STOP.
- You are about to include a field that already has a value in the `fields` parameter -> STOP.
```

これは普通のGitHub Actionsだけで書くなら、APIの戻り値と条件分岐を細かく実装するところだと思う。

gh-awでは、agentが判断する部分を自然言語で書き、書き込みだけはsafe outputに閉じ込める。今回でいうと、agentはProject itemやissueを読んで「何を更新したいか」を出す。実際にProjectを更新するのはsafe outputs jobで、`update-project` の許可範囲と `max` に縛られる。

この分離が扱いやすかった。

判断の質が悪ければMarkdown本文を直す。権限や出力範囲が足りなければfrontmatterを直してcompileする。どちらを触っているのかが分かりやすい。

この分かれ方が、Project以外の運用にも使いやすそうだった。

## おわり

gh-awの面白さは、AIが賢くissueを読んでくれることだけではなかった。

むしろ、既存のGitHub運用を壊さずに差し込める。issueはissueのまま、ProjectはProjectのまま、実行基盤はGitHub Actionsのまま。その上に、frontmatter付きMarkdownとgenerated workflowを1枚挟む。

名前はGitHub Agentic Workflowsで、仰々しい。ただ、自分の理解では、これは「MarkdownからGitHub Actionsを生成し、agentの読み取りとsafe outputの書き込みを分けるツール」である。

この粒度で見る方が、既存のGitHub運用にどこまで入れるかを判断しやすい。

ただし、Copilot engineを使う場合だけは別である。`COPILOT_GITHUB_TOKEN` は個人PATになり、GitHub Appでは置き換えられない。誰のCopilot requestを使うのかを最初に決めておく必要がある。
