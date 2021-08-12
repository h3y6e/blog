+++
title = "macOSで初期状態からのセットアップ"
date = Date(2019,09,26)
tags = ["macos", "setup"]
rss_description = "新しいMacを買ったときとか、macOSをファクトリーリセットしたい衝動に駆られたときに。"
+++

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">掃除出来ない人間はコマンド叩いた時の多少のエラーとかは動けば放置してしまうから、いっそ定期的にリストアするぞくらいの気持ちのほうが良い</p>&mdash; へいほぅ (@5ebec) <a href="https://twitter.com/5ebec/status/1049345182955528197?ref_src=twsrc%5Etfw">October 8, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

## バックアップ

#### BetterTouchTool

β版だが、 設定 > 同期で \\
 - [x] 同期を有効にする

#### mackup の cfg

`.mackup/$app_name$.cfg` に、以下の形式で保存する。

```
[application]
name = $app_name$

[configuration_files]
$configfile$
```

#### シェル実行

```shell
$ brew bundle dump --global
$ mackup backup
```

## 起動直後

流れに沿ってデスクトップが表示されるところまで行く。

## システム環境設定

#### 一般

* スクロールバーのクリック時： クリックされた場所にジャンプ  
* 書類をとじるときに変更内容を保持するかどうかを確認  

#### Dock
サイズ/拡大は適当に。

* ウィンドウをアプリケーションアイコンにしまう

#### Touch ID
設定する。

#### アクセスビリティ

* ディスプレイ
  - [x] 視差効果を減らす

#### セキュリティとプライバシー

* ファイアウォール
  * ファイアウォールをオンにする

#### ディスプレイ

* ディスプレイ
  * 解像度： 変更 > スペースを拡大  
  - [ ] 輝度を自動調整

#### サウンド

* メニューバーに音量を表示

#### キーボード

* キーボード
  * キーのリピート： 最速
  * リピート入力認識までの時間： 最短
  * 環境光が暗い場合にキーボードの輝度を調整
  * 修飾キー… > Caps Lock キー: Control
* ショートカット
  * Launchpad を表示： Control+Shift+L
  * デスクトップ[Num]へ切り替え  
  * 以下は Google Chrome をインストールしアカウントを追加した後 \\
    アプリケーションで Google Chrome を選択 \\
    メニュータイトルにアカウントの名前を正確に入力 \\
    キーボードショートカット： Control+Command+[Num]


#### トラックパッド

* クリック： 弱い
* 起動の速さ： 中心から 1 つ右

#### バッテリー

<!-- textlint-disable ja-technical-writing/no-doubled-joshi -->

* バッテリー
  * ディスプレイをオフにするまでの時間： 5 分
* 電源アダプタ
  * 電源アダプタに接続中に Power Nap をオンにする

<!-- textlint-enable ja-technical-writing/no-doubled-joshi -->

#### 共有

コンピュータ名を変更する。

#### Time Machine

* バックアップを自動生成
* Time Machine をメニューバーに表示

## Homebrew

[Homebrew](https://brew.sh/) をインストールする。

```shell
$ /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Dropbox, mackup をインストール

```shell
$ brew install mackup
$ brew install --cask dropbox
```

#### Dropbox

起動してログイン。

#### mackup

```shell
$ mackup restore
```

#### Homebrew Package のインストール

```shell
$ brew bundle --global
```

#### [prezto](https://github.com/sorin-ionescu/prezto)のインストール
```shell
$ git clone --recursive https://github.com/sorin-ionescu/prezto.git "${ZDOTDIR:-$HOME}/.zprezto"
```

## 各種 App
Launchpad から起動する。

## ssh
[ssh keys](https://blog.5ebec.dev/posts/ssh-keys/)
