+++
title = "issueを出したら実装される世界をgh-awで見た"
date = Date(2026, 4, 24)
tags = ["github", "copilot", "gh-aw"]
rss_description = ""
+++

## 経緯

[GitHub Agentic Workflows](https://github.github.io/gh-aw/)の `gh-aw` を触っていて、`safe-outputs.update-project` と `github-app` の組み合わせで権限不足に当たった。

Project v2のitemがissueを指していると、内部で `repository.issue(number:)` を引く必要がある。しかし、生成されたGitHub App tokenに `issues: read` が付かない。そのため実行時は `NOT_FOUND` になる。

手元では生成済みのlock fileに `permission-issues: read` を足すと通ったので、実装箇所と再現、workaround、修正方針を書いてissueにした。

{{ embed https://github.com/github/gh-aw/issues/27794 }}

このあとが面白かった。

公開タイムライン上では、maintainerが `community` labelを付け、Copilotとmaintainer自身をassignしている。その直後にCopilotのSWE agentがbranchを作り、PRを出していた。

{{ embed https://github.com/github/gh-aw/pull/27837 }}

PRには実装、回帰テスト、ドキュメント更新が入っていた。内容としては、`update-project` のpermission計算に `issues: read` を足し、GitHub App token生成のテストとsafe-outputs referenceを更新するものだった。

さらにCopilotのPR reviewerも走っていて、`create-project` + `item_url` でも同じ問題がありそうだとコメントしていた。最終的にはmaintainerがapproveしてmergeし、issueは同じ日にcloseされている。

もちろん完全無人ではない。人間のmaintainerがlabelを付け、assignし、approveしている。ただ、自分が外からissueを出したあとに、リポジトリ側のワークフローがかなり自然に「実装されるところ」まで運んでいるのが見えた。

## 良かったのはCopilotがコードを書いたことではない

Copilotがコードを書いた、というだけなら今では珍しくない。

良かったのは、リポジトリが最初から「issueを受け取り、agentに渡し、PRとして出し、レビューして、必要ならさらにagentへ戻す」場所として整えられていることだった。

`gh-aw` のリポジトリを見ると、`.github/workflows/` に大量のMarkdown workflowと生成済みlock fileがある。たとえば、新規issueのtriage、refactoring cadence、semantic function refactoring、Copilot branchのmaintenanceなどが定義されている。

これは単にAIに作業させているのではなく、AIが動くための面をリポジトリ内に作っている状態に近い。

どのイベントで動くか。どのengineを使うか。どのGitHub toolを使えるか。どのwrite operationをsafe outputとして許すか。何件まで許すか。どのlabelだけ許すか。そういう制約がworkflowに入っている。

つまり、人間がagentへ直接「いい感じに直して」と頼むのではなく、agentが触れる範囲と出せる成果物をリポジトリ側が定義している。

ここが一番重要に見えた。

## ローカルエージェントを非エンジニアに渡すのは違う

以前、普段コードを書かない人がCodex Appから働きやすいように、メタリポジトリやskillsを整える話を書いた。

その方向自体は今も良いと思っている。ただ、プロダクト開発の標準入口として、非エンジニアにClaude CodeやCodex CLIのようなローカルで動くコーディングエージェントを直接使ってもらうのは筋が悪いと感じている。

理由はいくつかある。

- ローカル環境には、作業対象以外のファイル、認証情報、ssh設定、ブラウザ由来の状態などが混ざりやすい
- agentにどこまで読ませてよいか、どこまで書かせてよいかを利用者側で判断する必要がある
- shellやfilesystemの操作が、プロダクトのissueやreviewの境界を簡単に越えてしまう
- 作業結果がGitHub上のissue、PR、review、CIという監査可能な流れに乗るとは限らない

これは能力の問題ではなく、関心の分離の問題だと思う。

プランナーやCSやデザイナーがやりたいのは、ローカルのrepoを操作することではない。バグを報告したい。仕様のズレを伝えたい。文言を直したい。優先度や受け入れ条件を伝えたい。

であれば、入口はローカルのagentではなくissueでよい。

issueには、タイトル、本文、label、assignee、project、comment、linked PRがある。権限・監査・通知もある。プロダクト開発の共同作業単位としてすでに成立している。

そこにagentic workflowをつなぐ方が自然だ。

## エンジニアの仕事が変わる

プロダクト開発で早めに作るべきなのは、「プランナーがissueを出すと実装される」状態だと思う。

これは、プランナーが実装者になるという意味ではない。エンジニアが不要になるという話でもない。

むしろ逆で、エンジニアの仕事は実装を1つずつ抱えることから、実装が安全に流れるworkflowを保守することへ寄っていく。

たとえば、次のようなものを整え続ける必要がある。

- issue templateとacceptance criteria
- agentが読むrepo knowledgeやskills
- 実装に入ってよいissueの条件
- PRを作るagentとreviewするagentの役割分担
- safe output、GitHub App permission、secretの扱い
- CIで落とすべきものと、人間が判断すべきものの境界
- agentが間違えたときにworkflowへ戻すチューニングループ

これは最近の言葉でいうと、ハーネスエンジニアリングに近いのだと思う。バズワードっぽいのであまり使いたくないが、やっていること自体はかなり実感がある。

人間がAIに頑張って指示するのではなく、AIが安全に失敗できるharnessを作る。入力はissue。出力はPRやcomment。書き込みはsafe outputやreviewの内側に閉じ込める。

`gh-aw` のdogfoodingで見えたのは、この形がかなり現実になっているということだった。

## おわり

今回のissueは小さい権限バグだったが、体験としてはかなり象徴的だった。

外部コントリビュータがissueを出す。maintainerがCopilotに渡す。CopilotがPRを作る。Copilot reviewerが別観点でコメントする。maintainerがmergeする。

この流れがGitHub上のissueとPRに閉じている。

非エンジニアにローカルのコーディングエージェントを配って使い方を教えるより、issueを入口にして、リポジトリ側にagentic workflowを整える方がよほどプロダクト開発らしい。

全員がエージェントを直接操作する世界ではなく、全員がissueを書けて、その先の実装・検証・反映をworkflowが運ぶ世界を作りたい。
