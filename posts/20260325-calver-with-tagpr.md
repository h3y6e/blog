+++
title = "バージョニングで悩みたくないならCalVer"
date = Date(2026, 3, 25)
tags = ["github", "calver"]
rss_description = "SemVerの意味付けがしにくく定期的にリリースするプロダクトのバージョニングにはCalVerを採用しよう"
+++

## この記事の対象

ライブラリやSDKであれば[SemVer](https://semver.org/)が適している。公開APIの互換性を壊すならmajor、機能追加ならminor、バグ修正ならpatchと、意味が明確で、依存する側がバージョンを見て判断できる。

一方、提供する機能とは関係なく定期的にリリースするプロダクトや、バージョンにSemVerのような意味付けがしにくいプロダクトもある。
Webサービスや社内ツールなど、エンドユーザーがバージョン番号を見て依存関係を判断するわけではないものがこれにあたる。こうしたプロダクトでは何が公開APIなのかが曖昧で、major・minor・patchの判断に意味のないコストがかかりやすい。

この記事は、そういったSemVerの意味付けがしにくく、定期的にリリースするプロダクトのバージョニングに絞って書いている。

## CalVerという選択肢

[CalVer (Calendar Versioning)](https://calver.org/) では、リリース日をバージョン番号に組み込む。

{{ embed https://calver.org }}

たとえば `YYYY.MM.MICRO` というスキームを採用すると、2026年3月の最初のリリースは `v2026.3.0`、同月内の次のリリースは `v2026.3.1` になる。

CalVerの利点は主に2つある。

- バージョン番号の決定にコミュニケーションが要らない: リリースすれば日付から自動的に番号が決まるので、majorやminorの判断が要らない
- リリース日が一目でわかる: CalVerはバージョン番号に日付を含むため、プロダクトのリリース時期を即座に読み取れる

OSではUbuntu (`YY.0M.MICRO`) やiOS, macOS (`YY.MINOR`)、iOSアプリではBitwarden (`YYYY.MM.MICRO`) やMastodon (`YYYY.MINOR`) など、幅広く採用されている。開発ツールでもpip (`YY.MINOR.MICRO`) やUnity (`YYYY.MINOR.MICRO`) の採用例がある。

## tagprでCalVer + monorepoを運用する
[tagpr](https://github.com/Songmu/tagpr)は、mainブランチへのpushをトリガーにリリースPRの自動作成・タグ付け・GitHub Releaseの作成を一貫して行ってくれる。
tagpr自体の詳しい説明は[作者様のブログ記事](https://songmu.jp/riji/entry/2022-09-05-tagpr.html)が大変わかりやすいので、そちらを参照するとよい。

{{ embed https://github.com/Songmu/tagpr }}

もともとSemVerベースのツールだったが、[monorepo対応](https://github.com/Songmu/tagpr/issues/210)と[CalVer対応](https://github.com/Songmu/tagpr/pull/288)が入ったことで、monorepo構成のプロダクトでもCalVerの運用を自動化しやすくなった。

### CalVer有効時の挙動

SemVerモードのtagprでは、マージされたPRに `major` / `minor` ラベルが付いていればそれに応じたバージョンbumpを行い、なければpatchのbumpになる。リリースPRに `tagpr:major` や `tagpr:minor` ラベルを手動で付けて調整できる。SemVerで使うとしても素直に使える。

CalVerを有効にすると、この仕組みが変わる。

- **major/minorラベルは無視される**。バージョンは日付から自動で決まる
- 同じ年月内で複数リリースがある場合、MICROが自動インクリメントされる（`v2026.3.0` → `v2026.3.1` → ...）
- 月が変われば `v2026.4.0` から再スタートする

「次のバージョンは何にするか」という判断ポイントがなくなり、バージョニング議論を消せる。

### monorepoでの設定

monorepoでは、各アプリのディレクトリに `.tagpr` を配置する。`tagPrefix` でタグを区別し、`calendarVersioning` でスキームを指定する。

```ini
	[tagpr]
	releaseBranch = main
	versionFile = apps/web/package.json
	vPrefix = true
	tagPrefix = web
	changelog = false
	calendarVersioning = YYYY.MM.MICRO
```

GitHub Actionsのワークフロー側では、matrixで各パッケージのconfigを指定する。

```yaml
jobs:
  tagpr:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        package: [apps/web, apps/docs]
    steps:
      - uses: actions/checkout@v6
        with:
          persist-credentials: false
      - uses: Songmu/tagpr@v1
        with:
          config: ${{ matrix.package }}/.tagpr
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## release-pleaseからの移行

以前、[release-please](https://github.com/googleapis/release-please)でSemVerのリリースフローを組んでいたmonorepoを、tagpr + CalVerへ移行したことがある。ここでは `apps/` 以下に `docs` と `web` の2つのアプリがある構成を例にする。

移行時にやったことは以下の通り。

1. tagpr設定の追加: 各アプリのディレクトリに `.tagpr` を配置
2. ブリッジタグの作成: `docs@v1.x.x` と同じコミットに `docs/v2026.3.0` のタグを打ち、タグ体系を接続
3. package.jsonのバージョン更新: `1.x.x` を `2026.3.0` に変更。tagprは最新のgitタグからバージョンを決めるが、`versionFile` の値との不整合があるとリリースPRが正しく作られないため、合わせておく必要がある
4. 関連ワークフローのタグパターン変更: デプロイワークフローなどで `docs@v*` を参照していた箇所を `docs/v*` に変更
5. release-please関連ファイルの削除: `release-please-config.json`、`.release-please-manifest.json`、ワークフローを削除


## 単一パッケージでの利用

もちろんmonorepoでなくても使える。
自分が作っている [h3y6e/skills](https://github.com/h3y6e/skills) はAgent Skillsを管理するCLIツールで、単一パッケージだがCalVerを採用している。

```ini
[tagpr]
	releaseBranch = main
	versionFile = -
	vPrefix = true
	calendarVersioning = YYYY.MM.MICRO
	command = "mise run prerelease"
```

`versionFile = -` とすれば、バージョンファイルを使わずgitタグだけで管理できる。

## おわりに

この記事で言いたかったのは、SemVerの意味付けがしにくく定期的にリリースするプロダクトのバージョニングにはCalVerが噛み合いやすい、という点にある。
tagprのCalVer + monorepo対応が入ったことで、この方針を実際の運用に乗せやすくなった。

バージョニングに悩まされる時間があるなら、その分プロダクトそのものに集中したい。
SemVerがしっくりこないと感じているなら、CalVerを試してみる価値はある。
