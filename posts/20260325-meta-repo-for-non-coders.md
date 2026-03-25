+++
title = "普段コードを書かない人が働きやすいようにメタリポジトリを整える"
date = Date(2026, 3, 25)
tags = ["git", "claude", "codex"]
rss_description = "普段コードを書かない人がCodex Appから仕様書作成や横断調査を進めやすくするために、メタリポジトリとskillsを整えている。submoduleで集約しているが難しさも残る"
+++

## 背景

最近チームでやっていることの1つに、普段コードを書かない人が[Codex App](https://openai.com/codex)で働きやすい状態を作ることがある。

{{ embed https://developers.openai.com/codex/app }}

仕様書を書きたい、文言の差分を見たい、データを分析したい、といった仕事はある。ただ、そのたびに「このrepoを見て、その次にこのrepoも見て、必要ならこのドキュメントも見てください」と説明する負担は大きい。gitやshellに慣れていない人には、そこが最初の壁になる。

やりたいのは、gitを覚えてもらうことではなく、Codex Appから自然言語で仕事を依頼できる状態を作ることにある。そのためにメタリポジトリを作り、横断で見る必要のあるrepoと `.agents/skills/` を1箇所に集めている。

## 何を置いているか

メタリポジトリ自体に実装はない。横断調査や仕様整理の起点として使い、実装やPRは各対象repoで行う。

```sh
.
├── 📁 .agents/skills
├── 📁 docs
├── 📁 <project-name>-client
├── 📁 <project-name>-proto
├── 📁 <project-name>-server
├── ...
├── 📁 specs
├── 📖 AGENTS.md
├── ⚙️ mise.toml
└── 🐚 setup.sh
```

client、server、protoなどのrepoをsubmoduleとしてぶら下げている。仕様書はメタリポジトリの `specs/` に置いていて、skillが実装や会話ログを参照しながらここに書き出す。初回セットアップや更新は `./setup.sh` と[mise tasks](https://mise.jdx.dev/tasks/)に寄せている。

`AGENTS.md` では、メタリポジトリのスコープを「横断調査・情報整理・意思決定支援」に限定し、実装は対象repoで行うと明記している。普段コードを書かない人を第一に想定し、説明はシンプルに保つよう指示している。

skillsとしては、たとえば次のようなものを置いている。実際にはプロダクト名をプレフィックスにしている。

- `<project-name>-setup`: Codex Appでの初回セットアップや更新を進める
- `<project-name>-spec-writer`: `specs/` に仕様書を書く
- `<project-name>-i18n-checker`: mobileとwebの文言差分を見る
- `<project-name>-bq-analysis`: BigQueryでの調査を安全に進める
- `<project-name>-grafana-analysis`: 障害調査を進める

setupスキルを例に見ると、想定ユーザーをCLIに不慣れな人と定義し、Codex App経由でのセットアップを前提にしている。skillが自分で実行し、権限ダイアログやSSHアクセスの問題など自分ではできないことだけユーザーに止めてもらう設計にしている。

~~~
<details><summary><b>setupスキル抜粋</b></summary>
~~~

```
---
name: <project-name>-setup
description: Set up or refresh the meta-repo on macOS so this repo and its related repos are ready for local work. Use this skill whenever the user wants this repo to become usable or up to date.
---
```

**<project-name>-setup**

This repo is a meta-repo. Use this skill only for meta-repo bootstrap and refresh. If the issue moves into a submodule, switch to that repo's workflow.

Assumed user: A non-engineer who primarily uses Japanese and is unfamiliar with the CLI. The setup process is assumed to be performed through a desktop application such as Codex App.

- Respond in simple Japanese by default
- Run setup steps yourself when possible; do not push shell commands onto the user
- Only stop for user actions you cannot do yourself, such as permission dialogs or SSH access recovery

**Workflow**

1. Confirm you are in the meta-repo root
2. For first-time setup, trust the repo first, then run `./setup.sh`
3. If `./setup.sh` stops because `mise` is unavailable, fix the blocker and rerun
4. After `mise.toml` changes, refresh local tools
5. After pulling latest changes, align local submodules to the recorded commits

~~~
</details>
~~~

また、submodule側（本体側）でも `newbie` というskillを置いている。メタリポジトリのskillが横断調査や仕様整理を担うのに対して、こちらはそのrepo内での具体的な作業をCodexが代わりに進める。

## なぜCodexを入口にするのか

普段コードを書かない人にコマンド操作を理解してもらうより、Codexに仕事を渡す方が現実的だからだ。

たとえば、次のように頼める状態を作りたい。

- 「この機能の仕様書を書いて」
- 「mobileとwebで文言がずれていないか見て」
- 「この障害をログとメトリクスから見て」

例えばChatGPTは社内知識にアクセスできるが、情報を確実に取得できるわけではない。
仕様書、実装、文言、運用知識がファイルシステム上でつながっていれば、Codexは自分で必要なものを探せる。

## まだ難しいところ

ただ、まだうまくいっていると言い切れる段階ではない。

一番難しいのはsubmoduleである。人間にとって分かりづらいのはもちろん、AIエージェントにとってもrepoの境界をまたぐ操作は間違いやすい。

セットアップについては、Codex Appなら `.codex/environments/environment.toml` にスクリプトを設定しておけばWorktree作成時に自動実行されるので、ユーザーが `setup.sh` を意識する必要はない。

```sh
version = 1
name = "<project-name>"

[setup]
script = '''
mise trust
./setup.sh
'''
```

ただし、ローカルで直接触る場合にはまだ `mise` の導入やshell設定の反映、GitHub権限、SSH鍵といった環境依存の問題が残る。

それでも、普段コードを書かない人にrepo構造を理解してもらうより、Codex App越しにメタリポジトリを触ってもらう方が良さそうだと感じている。

## 所感

現時点で手応えがあるのは、メタリポジトリそのものではなく、「AIエージェントの入口を1つに寄せられること」にある。

これが一番良い方法だとは思っていなくて、まだ実験段階だ。ただ、普段コードを書かない人が働きやすい状態を作るには、promptを工夫するより先にrepo構成とskillの置き方を整える方が良いという感触がある。
