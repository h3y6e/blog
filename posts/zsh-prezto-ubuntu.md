@def title = "Ubuntu,Debianにzsh+prezto導入&テーマ変更"
@def date = Date(2019,05,25)
@def tags = ["ubuntu", "debian", "zsh", "prezto", "shell"]
@def rss = "ググればすぐ出てくるけど何回も同じ作業するのでいい加減まとめたほうがいい気がした"

~~~
<blockquote class="twitter-tweet" data-lang="ja" data-theme="dark"><p lang="ja" dir="ltr">bashは`sudo apt install zsh`をする場所だと思っている</p>&mdash; へいほぅ (@5ebec) <a href="https://twitter.com/5ebec/status/1115124604538744832?ref_src=twsrc%5Etfw">2019年4月8日</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

## zshインストール
UbuntuやDebianをインストールしたらまずターミナルを開いてこれを脳死で打つ。

```bash
$ sudo apt update
$ sudo apt upgrade
$ sudo apt install zsh
```

## prezto導入
以下でzshを起動

```bash
$ zsh
```
設定画面が開く場合がありますが、preztoを導入する場合はこの設定は必要ないので`q`で抜ける。
bashはここまで、以下はzsh内で

```zsh
git clone --recursive https://github.com/sorin-ionescu/prezto.git "${ZDOTDIR:-$HOME}/.zprezto"
chsh -s /usr/bin/zsh
```

以下を実行

```zsh
$ setopt EXTENDED_GLOB  
for rcfile in "${ZDOTDIR:-$HOME}"/.zprezto/runcoms/^README.md(.N); do  
  ln -s "$rcfile" "${ZDOTDIR:-$HOME}/.${rcfile:t}"  
done
```

再起動

```zsh
sudo reboot
```

これでターミナルを開いたときにzshが起動されるはず。

## テーマ変更
このまま使用してもよいが、preztoでは沢山のテーマが利用できるので好きなものに変える。  
ちなみにデフォルトは`sorin`というテーマ。

以下ですべてのテーマをプレビューできる。

```zsh
~ ❯❯❯ prompt -p
```

みんな大好きpowerlineもある。
~~みんなpowerline使ってるけどあれ何がいいの？フォント限られるし無駄にカラフルだし横に長くて邪魔じゃね？~~

テーマの設定は`.zpreztorc`ファイルの116行目に書かれている。  
自分は`pure`が好きなので、`sorin`から`pure`に変更しました。

```vim
zstyle ':prezto:module:prompt' theme 'pure'
```
vimで変更する場合は

```zsh
~ ❯❯❯ vim .zpreztorc
```
```
// vimコマンド
:%s/'sorin/'pure/
:wq
```
こうやると楽。

最後にシェルを再起動して完成。

```zsh
~ ❯❯❯ exec $SHELL -l
```

良いシェルライフを。

