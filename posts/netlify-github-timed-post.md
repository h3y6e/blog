+++
title = "Netlify +  GitHub ActionsでHugo製ブログの予約投稿"
date = Date(2019,12,07)
tags = ["hugo", "netlify", "githubactions", "ci"]
rss_description = "NetlifyでホスティングしているHugo製ブログで予約投稿したいなと思ってGitHub Actions使ったらめちゃ簡単だった。"
+++

## モチベーション

Hugo は静的サイトジェネレータであり、予約投稿というものが無い。これでは「アドベントカレンダーで 0 時に公開したい」などという時に困るので、どうにかして予約投稿を実現したい。

## tl;dr

Hugo 製ブログを Netlify でホスティングしている前提。
[Netlify の Build hooks](https://docs.netlify.com/configure-builds/build-hooks/#parameters)と[GitHub Actions の `schedule`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#scheduled-events-schedule)を用いる。

## Netlify の Build hooks

build と deploy をトリガーする為の URL。
ダッシュボードの `Settings > Build & deploy > Continuous Deployment > Build hooks` にある。
Add build hook から Build Hooks URL を作成する。name は参照用で、Build hooks のリストと deploy 時のメッセージに表示される。
branch は master にする。
![Add Build Hook](/img/2019-12-07/addbuildhook.png)
![Build Hooks URL](/img/2019-12-07/build_hooks_url.png)
生成された URL を用いて、端末で以下のような `curl` コマンドを叩くと、Netlify で build と deploy が実行される。

```shell
curl -X POST -d '{}' https://api.netlify.com/build_hooks/XXXXXXXXXXXXXXX
```

## GitHub Actions の `schedule`

別に他の CI サービスを用いても良いのだが、自分は Travis CI しか使ったことがなかったのと、[Travis CI の Cron Jobs](https://docs.travis-ci.com/user/cron-jobs/)では `daily` が最短なので却下。
そういえば GitHub Actions なんてものがあったなぁと思って触ってみた。

GitHub Actions ではリポジトリの `~/.github/workflows` 以下に YAML 構文でワークフローを定義する。
ワークフローの書き方は [Workflow syntax for GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions) を参考にされたい。

今回は「毎時 0 分に build & deploy を実行」させてみる。
```yaml
name: scheduler

on:
  schedule:
    - cron: '0 * * * *'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Post build hooks
      run: curl -X POST -d {} ${{ secrets.BUILD_HOOKS_URL }}
```

最終行の `${{ secrets.BUILD_HOOKS_URL }}` は GitHub の `Settings > Secrets` に設定した変数を呼び出している。ここに先程 Netlify で生成した Build Hooks URL を追加すればよい。
![Secrets](/img/2019-12-07/secrets_buildhooksurl.png)

これで完成。ちょうど 1 時間毎に実行されていることが確認出来る。
![Scheduler](/img/2019-12-07/scheduler_workflows.png)

## 利点
#### git が汚染されない
空 commit を master に push すれば Netlify が自動 build してくれるが、これだと log が汚れるので `curl` を叩いたほうが綺麗。
#### build 頻度が分単位で決定出来る
`schedule` を使って [POSIX cron 構文](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07) で記述出来る。
#### （ほぼ）無料
Public レポジトリなら無料、Private でもこの程度の使用なら無料。（Free で 2,000 分/月）
#### 簡単
学習コスト低い。

## まとめ
意外と簡単にできた。これ書いてるのがアドベントカレンダー前日。上手くいくと良いな〜。
