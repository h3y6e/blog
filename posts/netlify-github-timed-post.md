+++
title = "Netlify +  GitHub ActionsでHugo製ブログの予約投稿"
date = Date(2019,12,07)
tags = ["hugo", "netlify", "githubactions", "ci"]
rss = "NetlifyでホスティングしているHugo製ブログで予約投稿したいなと思ってGitHub Actions使ったらめちゃ簡単だった。"
+++

## モチベーション

Hugoは静的サイトジェネレータであり、予約投稿というものが無い。これでは「アドベントカレンダーで0時に公開したい」などという時に困るので、どうにかして予約投稿を実現したい。

## tl;dr

Hugo製ブログをNetlifyでホスティングしている前提。\
[NetlifyのBuild hooks](https://docs.netlify.com/configure-builds/build-hooks/#parameters)と[GitHub Actionsの`schedule`](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#scheduled-events-schedule)を用いる。

## NetlifyのBuild hooks

buildとdeployをトリガーする為のURL。\
ダッシュボードの`Settings > Build & deploy > Continuous Deployment > Build hooks`にある。
Add build hookからBuild Hooks URLを作成する。nameは参照用で、Build hooksのリストとdeploy時のメッセージに表示される。\
branchはmasterにする。
![Add Build Hook](/img/2019-12-07/addbuildhook.png)
![Build Hooks URL](/img/2019-12-07/build_hooks_url.png)
生成されたURLを用いて、端末で以下のような`curl`コマンドを叩くと、Netlifyでbuildとdeployが実行される。

```shell
curl -X POST -d '{}' https://api.netlify.com/build_hooks/XXXXXXXXXXXXXXX
```

## GitHub Actionsの`schedule`

別に他のCIサービスを用いても良いのだが、自分はTravis CIしか使ったことがなかったのと、[Travis CIのCron Jobs](https://docs.travis-ci.com/user/cron-jobs/)では`daily`が最短なので却下。\
そういえばGitHub Actionsなんてものがあったなぁと思って触ってみた。

GitHub Actionsではリポジトリの`~/.github/workflows`以下にYAML構文でワークフローを定義する。\
ワークフローの書き方は [Workflow syntax for GitHub Actions](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions) を参考にされたい。

今回は「毎時0分にbuild & deployを実行」させてみる。
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

最終行の`${{ secrets.BUILD_HOOKS_URL }}`はGitHubの`Settings > Secrets`に設定した変数を呼び出している。ここに先程Netlifyで生成したBuild Hooks URLを追加すればよい。
![Secrets](/img/2019-12-07/secrets_buildhooksurl.png)

これで完成。ちょうど1時間毎に実行されていることが確認できる。
![Scheduler](/img/2019-12-07/scheduler_workflows.png)

## 利点
#### gitが汚染されない
空commitをmasterにpushすればNetlifyが自動buildしてくれるが、これだとlogが汚れるので`curl`を叩いたほうが綺麗。
#### build頻度が分単位で決定できる
`schedule`を使って [POSIX cron 構文](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07) で記述できる。
#### （ほぼ）無料
Publicレポジトリなら無料、Privateでもこの程度の使用なら無料。（Freeで2,000分/月）
#### 簡単
学習コスト低い。

## まとめ
意外と簡単にできた。これ書いてるのがアドベントカレンダー前日。上手くいくと良いな〜
