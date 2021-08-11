+++
title = "誰得なAtomのSyntax themeを作った"
date = Date(2019, 12, 23)
tags = ["camphor", "adventcalendar", "atom", "vscode", "julia"]
rss = "Atomは好きですか？ライトテーマは好きですか？Juliaは好きですか？"
cover = "/img/2019-12-23/light-owl-syntax.jpg"
+++

この記事は [CAMPHOR- Advent Calendar](https://advent.camph.net/) 2019 の 23 日目の記事です。\\
22 日目の記事は[kazbno](https://twitter.com/kazbno)氏による[Verilog でミニプロセッサを実装してみた](http://kaz7890.hatenablog.com/entry/simple-riscv)でした。

おはようございます、へいほぅ（[@5ebec](https://twitter.com/5ebec)）です。3 日後に卒論の中間発表ですが進捗が無くてとても辛いです。

今回は最近研究の合間にぼちぼち作っている Atom の Syntax theme の話をします。

[![Light Owl Syntax](/img/2019-12-23/light-owl-syntax.jpg)](https://atom.io/themes/light-owl-syntax)

## 経緯
#### Atom との出会い、そして別
皆さん、Atom 使っていますか。\\
「皆さん◯◯使っていますか」構文は多くの記事で見られ、僕も利用しますが、◯◯が使われていない前提で利用するのは初めてです。

僕が Atom に初めて出会ったのは 3 年前、京大マイコンクラブ（KMC）の新歓でインストールした時でした。
その後様々なテキストエディタの存在を知り、色々と（Sublime Text 3/Spacemacs/SpaceVim/NeoVim/etc...）手を出してはいましたが、Atom への慣れと信仰心から何らかの形で使い続けていました。

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">これに勝てるLaTeXエディタを俺は知らない <a href="https://t.co/3Ymy6zhaen">pic.twitter.com/3Ymy6zhaen</a></p>&mdash; へいほぅ (@5ebec) <a href="https://twitter.com/5ebec/status/1065872335108956161?ref_src=twsrc%5Etfw">November 23, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

(ちなみにこの Syntax theme は[Flatwhite](https://atom.io/themes/flatwhite-syntax)というもので、foreground color を変えるのではなく background color を変えるので文書作成に最適です👍)

**テキストエディタとしては絶望的に遅い**と言われている Atom ですが、不必要なコアパッケージを Visable する等の工夫をすれば速度面でも問題はない…と思っていた時期も僕にはありました。**VSCode を使い始めるまでは。**

#### Light Owl に一目惚れした
皆さん、ライトテーマ使っていますか。\\
VSCode で一目惚れしてからずっと使っているテーマに[Light Owl](https://github.com/sdras/night-owl-vscode-theme/#light-owl)があります。名前の通り、ダークテーマである[Night Owl](https://github.com/sdras/night-owl-vscode-theme)のライトテーマ版なのですが、これは沢山の[他の環境](https://github.com/sdras/night-owl-vscode-theme#other-versions)（テキストエディタだけでなく、端末エミュレータや Alfred, Slack 等にも）に移植されるほど人気のあるテーマです。

この記事も勿論 VSCode + Light Owl で書いています😉

![VSCode Light Owl](/img/2019-12-23/vscode-light-owl.jpg)

#### Atom を再び使い始めた
皆さん、Julia 使っていますか。\\
何故 Atom の Syntax theme を作っているのかと言うと、[**Juno**](https://junolab.org/)という Atom 上に構築された Julia の IDE を使い始めたからです。  
Julia 自体は以前から使っており Juno の存在も認知していたのですが、主に数値計算に Julia を利用していたためエディタには Jupyter Notebook（及び Jupyter Lab）を用いていました。

2019/11/29 に開催された[JuliaTokyo #10](https://juliatokyo.connpass.com/event/153435/)で、CAMPHOR-のコアメンバーであり Juno のメンテナである[aviatesk](https://twitter.com/kdwkshh)氏によるトークを聞いて、その便利さに感動し Juno を使い始めました。

先程 Night Owl は他の環境に移植されていると言いましたが、Atom も例外ではなく[Night Owl Vs Code](https://atom.io/themes/night-owl-vs-code-syntax)という Syntax theme が作られています。

しかし Light Owl は Atom に移植されていないようだったので、作ることにしました。

## Syntax theme の作り方
公式ドキュメントがあるのでこれを見れば良いです。\\
[Creating a Theme --- Creating a Syntax Theme](https://flight-manual.atom.io/hacking-atom/sections/creating-a-theme/#creating-a-syntax-theme)

..。これだけで終わるのはあれなので、少し補足をします。  

#### 作成開始時
`Cmd+Shift+P` でコマンドパレットを表示し "Package Generator: Generate Syntax Theme" を選択すれば、`~/.atom/packages/` にシンボリックリンクの貼られたフォルダが作成され Syntax theme の作成を開始することが出来ます。しかし必要最低限の構成しか記述されていないので、この方法で真面目に作ろうとすると大変だと思います。

1 から Syntax theme を作成する場合でも、信頼出来る既存テーマをベースにして作成するほうが楽に感じました。僕は Atom のコアテーマである[One Light](https://github.com/atom/atom/tree/master/packages/one-light-syntax)を参考にして作成しています。

`~/.atom/packages/` にシンボリックリンクを貼るにはリポジトリ直下で以下を実行します。
```shell
$ apm link
```

#### シンタックスハイライト用テストコード
言語毎のルールを作成する際などに役に立つのが[このリポジトリ](https://github.com/atom/language-examples)です。

Atom にバンドルされている全ての言語のシンタックスハイライト用のテストコードが Atom 公式で用意されています。

Syntax theme の開発は、以下が基本の流れになると思います。

1. [atom/language-examples](https://github.com/atom/language-examples)を clone しておく。
2. Atom のコマンドパレットから"Application: Open Dev"を選択し、clone したフォルダを Dev Mode で開く。
3. コマンドパレットから"Window: Toggle Dev Tools"を選択し、Developer Tools を開く。
4. フロントエンド開発をするように Styles を確認しながら色を決めていく。

![dev mode](/img/2019-12-23/dev-mode.jpg)


#### 色可視化
色の可視化とサジェストに[Pigments](https://atom.io/packages/pigments)というパッケージが便利です。

Less の変数にも対応していてかなり使いやすいです。

![pigments](/img/2019-12-23/pigments.jpg)

しかし、Atom が重くなるという問題があるので Syntax theme の作成が一段落したら消したいです。.。

## できたもの
**Light Owl Syntax theme for Atom** という完全に俺得な Syntax theme が完成しました。

[light-owl-syntax](https://github.com/5ebec/light-owl-syntax)

JavaScript だとこんな感じ。

![atom screenshot](/img/2019-12-23/atom-screenshot.jpg)

比較として VSCode の Light Owl も載せておきます。\\
Atom と VSCode ではシンタックスハイライトの規則が異なる為、完全な移植は出来ませんが可能な限り忠実に移植出来ていると思います。

![vscode screenshot](/img/2019-12-23/vscode-screenshot.jpg)

この記事を書いている時点でサポートしている言語は、以下のとおりです。

- Julia
- Python
- JavaScript
- TypeScript
- CSS
- Less
- GitHub Markdown

勿論、他の言語も汎用的なルールによって着色はされます。

![screenshot2](/img/2019-12-23/gfm-less-python-js-screenshot.jpg)

## まとめ
自分が利用している道具が自分の手によって改善されるという体験は気持ちがいいですね。\\
まだ移植作業は終了していませんが、Atom を使っていて且つライトテーマが好きだという人は是非使ってみて下さい😊

[![Light Owl Syntax](/img/2019-12-23/light-owl-syntax.jpg)](https://atom.io/themes/light-owl-syntax)

### あとがき
macOS で Juno を使うとブレークポイントの赤丸が切れてしまう現象が気になっていたので、Light Owl Syntax にその修正コードを入れようかと考えていたのですが、aviatesk 氏が[atom-ink](https://github.com/JunoLab/atom-ink)に PR 送ったら？と提案してくれたので初めての OSS コミットをしました。ありがとうございます。

![atom ink](/img/2019-12-23/atom-ink.jpg)