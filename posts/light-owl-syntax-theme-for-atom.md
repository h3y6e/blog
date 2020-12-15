+++
title = "誰得なAtomのSyntax themeを作った"
date = Date(2019, 12, 23)
tags = ["camphor", "adventcalendar", "atom", "vscode", "julia"]
rss = "Atomは好きですか？ライトテーマは好きですか？Juliaは好きですか？"
cover = "/img/2019-12-23/light-owl-syntax.jpg"
+++

この記事は [CAMPHOR- Advent Calendar](https://advent.camph.net/) 2019の23日目の記事です。\\
22日目の記事は[kazbno](https://twitter.com/kazbno)氏による[Verilog でミニプロセッサを実装してみた](http://kaz7890.hatenablog.com/entry/simple-riscv)でした。

おはようございます、へいほぅ（[@5ebec](https://twitter.com/5ebec))です。3日後に卒論の中間発表ですが進捗が無くてとても辛いです。

今回は最近研究の合間にぼちぼち作っているAtomのSyntax themeの話をします。

[![Light Owl Syntax](/img/2019-12-23/light-owl-syntax.jpg)](https://atom.io/themes/light-owl-syntax)

## 経緯
#### Atomとの出会い、そして別れ
皆さん、Atom使っていますか。\\
「皆さん〇〇使っていますか」構文は多くの記事で見られ、僕も利用しますが、〇〇が使われていない前提で利用するのは初めてです。

僕がAtomに初めて出会ったのは3年前、京大マイコンクラブ（KMC)の新歓でインストールした時でした。\\
中学の時にWindows Vistaのメモ帳でJavaScriptを書いていた（高校では受験勉強のため一文字もコードを書いていなかった）自分にとって、こんな多機能でお洒落なテキストエディタがあったのかと驚かされ、**_A hackable text editor for the 21st Century_**という文句が僕の心を刺激しました。\\
その後様々なテキストエディタの存在を知り、色々と（Sublime Text 3, Spacemacs, SpaceVim, NeoVim, etc...)手を出してはいましたが、Atomへの慣れと信仰心から何らかの形で使い続けていました。

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">これに勝てるLaTeXエディタを俺は知らない <a href="https://t.co/3Ymy6zhaen">pic.twitter.com/3Ymy6zhaen</a></p>&mdash; へいほぅ (@5ebec) <a href="https://twitter.com/5ebec/status/1065872335108956161?ref_src=twsrc%5Etfw">November 23, 2018</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

(ちなみにこのSyntax themeは[Flatwhite](https://atom.io/themes/flatwhite-syntax)というもので、foreground colorを変えるのではなくbackground colorを変えるので文書作成に最適です👍)

**テキストエディタとしては絶望的に遅い**と言われているAtomですが、不必要なコアパッケージをVisableする等の工夫をすれば速度面でも問題はない…と思っていた時期も僕にはありました。**VSCodeを使い始めるまでは。**

#### Light Owlに一目惚れした
皆さん、ライトテーマ使っていますか。\\
VSCodeで一目惚れしてからずっと使っているテーマに[Light Owl](https://github.com/sdras/night-owl-vscode-theme/#light-owl)があります。名前の通り、ダークテーマである[Night Owl](https://github.com/sdras/night-owl-vscode-theme)のライトテーマ版なのですが、これは沢山の[他の環境](https://github.com/sdras/night-owl-vscode-theme#other-versions)(テキストエディタだけでなく、端末エミュレータやAlfred, Slack等にも）に移植されるほど人気のあるテーマです。

この記事も勿論VSCode + Light Owlで書いています😉

![VSCode Light Owl](/img/2019-12-23/vscode-light-owl.jpg)

#### Atomを再び使い始めた
皆さん、Julia使っていますか。\\
何故AtomのSyntax themeを作っているのかと言うと、[**Juno**](https://junolab.org/)というAtom上に構築されたJuliaのIDEを使い始めたからです。  
Julia自体は以前から使っておりJunoの存在も認知していたのですが、主に数値計算にJuliaを利用していたためエディタにはJupyter Notebook(及びJupyter Lab)を用いていました。

2019/11/29に開催された[JuliaTokyo #10](https://juliatokyo.connpass.com/event/153435/)で、CAMPHOR-のコアメンバーでありJunoのメンテナである[aviatesk](https://twitter.com/kdwkshh)氏によるトークを聞いて、その便利さに感動しJunoを使い始めました。

先程Night Owlは他の環境に移植されていると言いましたが、Atomも例外ではなく[Night Owl Vs Code](https://atom.io/themes/night-owl-vs-code-syntax)というSyntax themeが作られています。

しかしLight OwlはAtomに移植されていないようだったので、作ることにしました。

## Syntax themeの作り方
公式ドキュメントがあるのでこれを見れば良いです。\\
[Creating a Theme --- Creating a Syntax Theme](https://flight-manual.atom.io/hacking-atom/sections/creating-a-theme/#creating-a-syntax-theme)

..。これだけで終わるのはあれなので、少し補足をします。  

#### 作成開始時
`Cmd+Shift+P`でコマンドパレットを表示し"Package Generator: Generate Syntax Theme"を選択すれば、`~/.atom/packages/`にシンボリックリンクが貼られたフォルダが作成されSyntax themeの作成を開始することが出来ます。しかし必要最低限の構成しか記述されていないので、この方法で真面目に作ろうとすると大変だと思います。

1からSyntax themeを作成する場合でも、信頼できる既存テーマをベースにして作成するほうが楽に感じました。僕はAtomのコアテーマである[One Light](https://github.com/atom/atom/tree/master/packages/one-light-syntax)を参考にして作成しています。

`~/.atom/packages/`にシンボリックリンクを貼るにはリポジトリ直下で
```shell
$ apm link
```
を実行します。

#### シンタックスハイライト用テストコード
言語毎のルールを作成する際などに役に立つのが[このリポジトリ](https://github.com/atom/language-examples)です。

Atomにバンドルされている全ての言語のシンタックスハイライト用のテストコードがAtom公式で用意されています。

Syntax themeの開発は、

1. [atom/language-examples](https://github.com/atom/language-examples)をcloneしておく。
1. Atomのコマンドパレットから"Application: Open Dev"を選択し、cloneしたフォルダをDev Modeで開く。
1. コマンドパレットから"Window: Toggle Dev Tools"を選択し、Developer Toolsを開く。
1. フロントエンド開発を行うようにStylesを確認しながら色を決めていく。

![dev mode](/img/2019-12-23/dev-mode.jpg)

というのが基本の流れになると思います。

#### 色可視化
色の可視化とサジェストに[Pigments](https://atom.io/packages/pigments)というパッケージが便利です。

Lessの変数にも対応していてかなり使いやすいです。

![pigments](/img/2019-12-23/pigments.jpg)

しかし、Atomが重くなるという問題があるのでSyntax themeの作成が一段落したら消したいです。..

## できたもの
**Light Owl Syntax theme for Atom** という完全に俺得なSyntax themeが完成しました。

[light-owl-syntax](https://github.com/5ebec/light-owl-syntax)

JavaScriptだとこんな感じ。

![atom screenshot](/img/2019-12-23/atom-screenshot.jpg)

比較としてVSCodeのLight Owlも載せておきます。\\
AtomとVSCodeではシンタックスハイライトの規則が異なる為、完全な移植は出来ませんが可能な限り忠実に移植出来ていると思います。

![vscode screenshot](/img/2019-12-23/vscode-screenshot.jpg)

この記事を書いている時点でサポートしている言語は、

- Julia
- Python
- JavaScript
- TypeScript
- CSS
- Less
- GitHub Markdown

です。勿論、他の言語も汎用的なルールによって着色はされます。

![screenshot2](/img/2019-12-23/gfm-less-python-js-screenshot.jpg)

## まとめ
自分が利用している道具が自分の手によって改善されるという体験は気持ちがいいですね。\\
まだ移植作業は終了していませんが、Atomを使っていて且つライトテーマが好きだという人は是非使ってみて下さい😊

[![Light Owl Syntax](/img/2019-12-23/light-owl-syntax.jpg)](https://atom.io/themes/light-owl-syntax)

### あとがき
macOSでJunoを使うとブレークポイントの赤丸が切れてしまう現象が気になっていたので、Light Owl Syntaxにその修正コードを入れようかと考えていたのですが、aviatesk氏に[atom-ink](https://github.com/JunoLab/atom-ink)にPR送ったら？と提案されたので初めてのOSSコミットをしました。ありがとうございます🙏

![atom ink](/img/2019-12-23/atom-ink.jpg)