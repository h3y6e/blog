+++
title = "macOSで初期状態からのセットアップ"
date = Date(2022,12,05)
tags = ["macos", "setup"]
rss_description = "新しいMacを買ったときとか、macOSをファクトリーリセットしたい衝動に駆られたときに。"
+++

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">掃除出来ない人間はコマンド叩いた時の多少のエラーとかは動けば放置してしまうから、いっそ定期的にリストアするぞくらいの気持ちのほうが良い</p>&mdash; へいほぅ (@h3y6e) <a href="https://twitter.com/h3y6e/status/1049345182955528197?ref_src=twsrc%5Etfw">October 8, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

以前は[mackup](https://github.com/lra/mackup)を使っていたが、ここまで厳密にファイルを同期させたくない事が多かったのと、Intel MacとARM Macを同時に使いたかったので、現在は[chezmoi](https://github.com/twpayne/chezmoi)[^chezmoi] を使っている。

[^chezmoi]: フランス語らしい。読み方は /ʃeɪmwa/（shay-moi）。

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->

## chezmoiについての軽い取説
`$HOME/.local/share/chezmoi` 下で管理される。

### 管理対象の確認
```sh
chezmoi managed
```

### 追加
```sh
chezmoi add $FILE
chezmoi add --template $FILE # templateとして追加
```

管理対象のものを再追加する
```sh
chezmoi re-add
```

### 反映
```sh
chezmoi -v apply
```

## 事前準備（初期化前）

### Homebrew
```sh
brew bundle dump --force --file '~/.Brewfile'
```

### chezmoi
変更を https://github.com/h3y6e/dotfiles へ同期する。


## 起動直後
流れに沿ってデスクトップが表示されるところまで行く。

## システム環境設定

### 一般
* スクロールバーの表示: スクロール時に表示
* スクロールバーのクリック時： クリックされた場所にジャンプ
* \checked{書類をとじるときに変更内容を保持するかどうかを確認}

### Dockとメニューバー
#### Dock
サイズ/拡大は適当に。
* ウィンドウをアプリケーションアイコンにしまう
* Dockを自動的に表示/非表示

#### サウンド
* メニューバーに表示: 常に

#### バッテリー
* 割合（%）を表示

#### 時計
* 時計のオプション: 秒を表示

#### Spotlight
* \unchecked{メニューバーに表示}

### スクリーンタイム
* スクリーンタイム: オンにする

### アクセスビリティ
* ディスプレイ
* \checked{視差効果を減らす}

### セキュリティとプライバシー
#### ファイアウォール
  * ファイアウォールをオンにする

### キーボード
* キーボード
  * キーのリピート： 最速
  * リピート入力認識までの時間： 最短
  * 環境光が暗い場合にキーボードの輝度を調整
  * 🌐キーを押して: 音声入力を開始（🌐キーを2回押す）
  * 修飾キー… > Caps Lockキー: Control
* ショートカット
  * \checked{Launchpadを表示： Control+Shift+L}
  * \checked{デスクトップ[Num]へ切り替え}
  * \unchecked{前の入力ソースを選択}
  * \unchecked{入力メニューの次のソースを選択}

### トラックパッド
* クリック： 弱い
* 起動の速さ： 中心から1つ右
* \checked{サイレントクリック}

### ディスプレイ
* ディスプレイ
  * 解像度： 変更 > スペースを拡大
  * \unchecked{輝度を自動調整}

### バッテリー
* バッテリー
  * ディスプレイをオフにするまでの時間： 5分

### 共有
コンピュータ名を変更する。

### Time Machine
* バックアップを自動生成

## chezmoi
```sh
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply h3y6e
```

## Homebrew
[Homebrew](https://brew.sh/)をインストールする。
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Homebrew Packageのインストール。
```sh
brew bundle --global
```

## prezto
[prezto](https://github.com/sorin-ionescu/prezto)をインストールする。
```sh
git clone --recursive https://github.com/sorin-ionescu/prezto.git "${ZDOTDIR:-$HOME}/.zprezto"
```
zpreztoの更新は `zprezto-update` でできる。

## chezmoiの編集
```sh
chezmoi edit $FILE
chezmoi execute-template "{{ .chezmoi.os }}/{{ .chezmoi.arch }}" # templateのtestとdebug
```

## 各種App
Launchpadから起動する。

## ssh
[ssh keys](/posts/ssh-keys)
