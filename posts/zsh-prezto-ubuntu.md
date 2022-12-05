+++
title = "Ubuntu,Debianにzsh+prezto導入&テーマ変更"
date = Date(2019,05,25)
tags = ["ubuntu", "debian", "zsh", "prezto", "shell"]
rss_description = "ググればすぐ出てくるけど何回も同じ作業するのでいい加減まとめたほうがいい気がした。"
+++

~~~
<blockquote class="twitter-tweet" data-lang="ja" data-theme="dark"><p lang="ja" dir="ltr">bashは`sudo apt install zsh`をする場所だと思っている</p>&mdash; へいほぅ (@h3y6e) <a href="https://twitter.com/h3y6e/status/1115124604538744832?ref_src=twsrc%5Etfw">2019年4月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

## zshインストール
UbuntuやDebianをインストールしたらまずターミナルを開いてこれを脳死で打つ。

```shell
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install zsh
```

## prezto導入
zshを起動して以下を実行。

```shell
git clone --recursive https://github.com/sorin-ionescu/prezto.git "${ZDOTDIR:-$HOME}/.zprezto"
chsh -s /usr/bin/zsh
```

以下を実行。

```shell
$ setopt EXTENDED_GLOB  
for rcfile in "${ZDOTDIR:-$HOME}"/.zprezto/runcoms/^README.md(.N); do  
  ln -s "$rcfile" "${ZDOTDIR:-$HOME}/.${rcfile:t}"  
done
```

再起動。

```shell
sudo reboot
```

これでターミナルを開いたときにzshが起動されるはず。

## テーマ変更
このまま使用してもよいが、preztoでは沢山のテーマが利用出来るので好きなものに変える。  
ちなみにデフォルトは `sorin` というテーマ。

以下ですべてのテーマをプレビュー出来る。

```shell
~ ❯❯❯ prompt -p
```

みんな大好きpowerlineもある。

テーマの設定は `.zpreztorc` ファイルの116行目に書かれている。  
自分は `pure` が好きなので、`sorin` から `pure` に変更した。

```vim
zstyle ':prezto:module:prompt' theme 'pure'
```
vimで変更する場合は以下のようにやると楽。

```shell
~ ❯❯❯ vim .zpreztorc
```
```
// vimコマンド
:%s/'sorin/'pure/
:wq
```


最後にシェルを再起動して完成。

```shell
~ ❯❯❯ exec $SHELL -l
```

良いシェルライフを。

