@def title = "macOSで初期状態からのセットアップ"
@def date = Date(2019,09,26)
@def tags = ["macos", "setup"]
@def rss = "新しいMacを買ったときとか，macOSをファクトリーリセットしたい衝動に駆られたときに"

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">掃除出来ない人間はコマンド叩いた時の多少のエラーとかは動けば放置してしまうから、いっそ定期的にリストアするぞくらいの気持ちのほうが良い</p>&mdash; へいほぅ (@5ebec) <a href="https://twitter.com/5ebec/status/1049345182955528197?ref_src=twsrc%5Etfw">October 8, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

## バックアップ

#### BetterTouchTool

β版だが， 設定 > 同期 で \\
 - [x] 同期を有効にする

#### mackup の cfg

`.mackup/nvim.cfg`

```
[application]
name = nvim

[configuration_files]
.config/nvim
.nvimrc
.nvim
```

`.mackup/brewfile.cfg`

```
[application]
name = Brewfile

[configuration_files]
.Brewfile
Brewfile
```

#### シェル実行

```shell
$ brew bundle dump --global
$ mackup backup
```

## 起動直後

流れに沿ってデスクトップが表示されるところまで行く

## システム環境設定

#### 一般

* スクロールバーのクリック時: クリックされた場所にジャンプ  
* 書類をとじるときに変更内容を保持するかどうかを確認  

#### Dock

* ウィンドウをアプリケーションアイコンにしまう

#### セキュリティとプライバシー

* 一般
  * Apple Watch でこの Mac のロックを解除できるようにする
* ファイアウォール
  * ファイアウォールをオンにする

#### 内蔵 Retina ディスプレイ

* ディスプレイ
  * 解像度: 変更 > スペースを拡大
  * 輝度を自動調整

#### 省エネルギー

* バッテリー
  * ディスプレイをオフにするまでの時間: 5分
* 電源アダプタ
  * 電源アダプタに接続中に Power Nap をオンにする

#### キーボード

* キーボード
  * キーのリピート: 最速
  * リピート入力認識までの時間: 最短
  * 環境光が暗い場合にキーボードの輝度を調整
  * 修飾キー… > Caps Lock キー: Control
* ショートカット
  * Launchpad を表示: Control+Shift+L
  * デスクトップ [Num] へ切り替え  
  * 以下は Google Chrome をインストールしアカウントを追加した後  
アプリケーション で Google Chrome を選択  
メニュータイトルにアカウントの名前を正確に入力  
キーボードショートカット: Control+Command+[Num]

#### トラックパッド

* クリック: 弱い
* 起動の速さ: 中心から1つ右

#### サウンド

* メニューバーに音量を表示

#### 共有

* コンピュータ名: (変更する)

#### Siri

* メニューバーに Siri を表示

#### 日付と時刻

* 秒を表示
* 日付を表示

#### Time Machine

* バックアップを自動生成
* Time Machine をメニューバーに表示

#### アクセスビリティ

* ディスプレイ
  * 視差効果を減らす

## Homebrew

[Homebrew](https://brew.sh/) をインストールする  

```shell
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

#### Dropbox, mackup をインストール

```shell
$ brew install mackup
$ brew cask install dropbox
```

#### Dropbox

起動してログイン

#### mackup

```shell
$ mackup restore
```

#### Homebrew Package のインストール

```shell
$ brew bundle --global
```

## 各種App
Launchpad から起動する

## ssh
https://blog.5ebec.dev/posts/ssh-keys/


