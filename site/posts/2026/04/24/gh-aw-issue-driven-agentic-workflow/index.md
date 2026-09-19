---
title: "issueを出したら実装される世界をgh-awで見た"
date: 2026-04-24
type: "Report"
aliases: ["/posts/20260424-gh-aw-issue-driven-agentic-workflow/"]
tags: ["copilot", "gha"]
rss_description: "GitHub WorkflowsでAI Agentの出入り口を設計する方法"
---

## 経緯

[GitHub Agentic Workflows](https://github.github.io/gh-aw/)の `gh-aw` を触っていて、`safe-outputs.update-project` と `github-app` の組み合わせで権限不足に当たった。

Project v2のitemがissueを指していると、内部で `repository.issue(number:)` を引く必要がある。しかし、生成されたGitHub App tokenに `issues: read` が付かない。そのため実行時は `NOT_FOUND` になる。

手元では生成済みのlock fileに `permission-issues: read` を足すと通ったので、実装箇所と再現、workaround、修正方針を書いてissueにした。

{{ embed https://github.com/github/gh-aw/issues/27794 }}

## issueからPRまで

公開タイムライン上では、メンテナーが `community` ラベルを付け、Copilotとメンテナー自身をassignしている。その直後にCopilotのSWEエージェントがbranchを作り、PRを出していた。

{{ embed https://github.com/github/gh-aw/pull/27837 }}

PRには実装、回帰テスト、ドキュメント更新が入っていた。内容としては、`update-project` の権限計算に `issues: read` を足し、GitHub App token生成のテストとsafe-outputs referenceを更新するものだった。

さらにCopilotのPR reviewerも動いていて、`create-project` + `item_url` でも同じ問題がありそうだとコメントしていた。
最終的にはメンテナーがapproveしてmergeし、issueは同じ日にcloseされている。

もちろん完全無人ではない。人間のメンテナーがラベルを付け、assignし、approveしている。
ただ、外からissueを出したあとに、リポジトリ側のワークフローが自然に「実装されるところ」まで運んでいるのが見えた。

## エージェントが動く場所

Copilotがコードを書いたこと自体は、もうあまり珍しくない。

良かったのは、リポジトリが最初から「issueを受け取り、エージェントに渡し、PRとして出し、レビューして、必要ならさらにエージェントへ戻す」場所として整えられていることだった。

`gh-aw` のリポジトリを見ると、`.github/workflows/` に大量のMarkdownワークフローと生成済みlock fileがある。新規issueのtriage、refactoring cadence、semantic function refactoring、Copilot branchのmaintenanceなどが定義されている。

これは単にAIに作業させているのではなく、AIが動くための面をリポジトリ内に作っている状態に近い。

どのイベントでどのengineを使って動くか。どのGitHub toolを使えるか。どのwrite operationをsafe outputとして許すか。何件まで、どのラベルだけ許すか。そういう制約がワークフローに入っている。

人間がエージェントへ直接「いい感じに直して」と頼むのではなく、エージェントが触れる範囲と出せる成果物をリポジトリ側が定義している。

ここが重要に見えた。

## ローカルエージェントを非エンジニアに渡すのは違う

以前、[普段コードを書かない人がCodex Appから働きやすいように、メタリポジトリやskillsを整える話](/posts/2026/03/25/meta-repo-for-non-coders/)を書いた。

その方向自体は今も良いと思っている。ただ、プロダクト開発の標準的な受け口として、非エンジニアにClaude CodeやCodexのようなローカルで動くコーディングエージェントを直接使ってもらうのは筋が悪いと感じている。

理由はいくつかある。

- ローカル環境には、作業対象以外のファイル、認証情報、ssh設定、ブラウザ由来の状態などが紛れ込みやすい
- エージェントにどこまで読ませてよいか、どこまで書かせてよいかを利用者側で判断する必要がある
- shellやfilesystemの操作が、プロダクトのissueやreviewの境界を簡単に越えてしまう
- 作業結果がGitHub上のissue、PR、review、CIという監査可能な流れに乗るとは限らない

これは能力の問題ではなく、関心の分離の問題だと思う。

プランナーやCSやデザイナーがやりたいのは、ローカルのrepoを操作することではない。バグを報告したい。仕様のズレを伝えたい。文言を直したい。優先度や受け入れ条件を伝えたい。

であれば、受け口はローカルのエージェントではなくissueでよいのではないか。

issueには、タイトル、本文、ラベル、assignee、project、comment、linked PRがある。権限・監査・通知もある。プロダクト開発の共同作業単位としてすでに成立している。

そこにエージェンティックワークフローをつなぐ方が自然に見える。

## ワークフローを保守する仕事

プロダクト開発で作りたいのは、「プランナーがissueを出すと実装される」状態である。

プランナーが実装者になるという意味ではない。エンジニアが不要になるという話でもない。

むしろエンジニアの仕事は、実装を1つずつ抱えることから、実装が安全に流れるワークフローを保守することへ寄っていく。

たとえば、次のようなものを整え続ける必要がある。

- issue templateとacceptance criteria
- エージェントが読むrepo knowledgeやskills
- 実装に入ってよいissueの条件
- PRを作るエージェントとreviewするエージェントの役割分担
- safe output、GitHub Appの権限、secretの扱い
- CIで落とすべきものと、人間が判断すべきものの境界
- エージェントが間違えたときにワークフローへ戻すチューニングループ

これは最近の言葉でいうと、ハーネスエンジニアリングに近いのだと思う。バズワードっぽいのであまり使いたくないが、やっていること自体には実感がある。

人間がAIに頑張って指示するのではなく、AIが安全に失敗できるharnessを作る。入力はissue。出力はPRやcomment。書き込みはsafe outputやreviewの内側に閉じ込める。

`gh-aw` のdogfoodingで見えたのは、この形がかなり現実になっているということだった。

## おわり

今回のissueは小さい権限バグだったが、体験としてはかなり象徴的だった。

外部コントリビュータがissueを出す。メンテナーがCopilotに渡す。CopilotがPRを作る。Copilot reviewerが別観点でコメントする。メンテナーがmergeする。

この流れがGitHub上のissueとPRに閉じている。

非エンジニアにローカルのコーディングエージェントを配って使い方を教えるより、issueを受け口にして、リポジトリ側にエージェンティックワークフローを整える方がよほどプロダクト開発らしい。
