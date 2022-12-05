+++
title = "RustyKeys ビルドログ"
date = Date(2022,05,02)
tags = ["keyboard", "buildlog"]
rss_description =  "RustyKeysのビルドログです。"
cover = "/img/2022-05-02/rustykeys.jpg"
+++

~~~
<script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

## はじめに

本稿は[KOBA789](https://twitter.com/KOBA789)さんが設計された[RustyKeys](https://koba789.booth.pm/items/3787019)のビルドログです。参考までに活用していただければ幸いです。

また、RustyKeysのコミュニティがGitHub Discussionsで作られていますので、このキットについての質問や依頼はこちらにコメントを残すと幸せになれると思います。

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://github.com/KOBA789/rusty-keys" data-iframely-url="//iframely.net/b8YNiNO?card=small"></a></div></div>
~~~

---

[KOBA789さんのYouTube Live](https://youtu.be/7Rn1n0EEcfo)を観て面白そうなキットだなぁと思い、ゴールデンウィークのお供にと購入しました。
販売開始前から全裸待機していたら無事に買えました。1分で売り切れたようです。やば。

~~~
<blockquote class="twitter-tweet" data-theme="dark" data-dnt="true" align="center"><p lang="ja" dir="ltr">買えました。良かった / 「RustyKeys (初回版（再販予定なし）)」を Bracket Works で購入しました！ <a href="https://t.co/sJ5Cxk5byM">https://t.co/sJ5Cxk5byM</a> <a href="https://twitter.com/hashtag/booth_pm?src=hash&amp;ref_src=twsrc%5Etfw">#booth_pm</a></p>&mdash; へいほぅ (@h3y6e) <a href="https://twitter.com/h3y6e/status/1518534492902035456?ref_src=twsrc%5Etfw">April 25, 2022</a></blockquote>
~~~

## RustyKeysの特徴

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://shop.yushakobo.jp/products/4256" data-iframely-url="//iframely.net/6Ud2SnE?card=small"></a></div></div>
~~~

最大の特徴は、[ビルドガイド](https://rusty-keys.koba789.com)が組込みRustをサポートしており、既存のファームウェアには対応していない、という所でしょう。

勿論6キーのマクロパッドとしても利用可能ですが、組み立て・プログラミング自体を楽しむことを目的として開発されている為、組み込みRust入門・はんだ付け入門・キーボード自作入門に最適なキットとなっています。

## ビルドガイド
ビルドガイドは [rusty-keys.koba789.com](https://rusty-keys.koba789.com) です。
**作業の前に、必ず一読するようにしましょう。**

## 内容物の確認
内容物は以下のようになっています。

![キット](/img/2022-05-02/kit.jpg)

 - 基板: 1枚
 - Raspberry Pi Pico: 2個
   - 2つのRaspberry Pi Picoのうち1つはキーボード用、もう1つはデバッグアダプタ用です。
 - 1N4148（ダイオード）: 6個
 - L字ピンヘッダ（3P）: 1個
 - ジャンパ線（ソケット-ソケット3P）: 1本
 - ピンヘッダ（40P）: 1個
 - ゴム足: 4個

## 自分で用意するもの
 - Cherry MX互換キースイッチ: 6個
今回は[Kailh BOX Silent Pink](https://shop.yushakobo.jp/products/kailh-box-silent-switch)を用いました。
また、キースイッチをはんだ付け無しで取り外し（ソケット化）出来るようにする[Mill-Max Socket](https://shop.yushakobo.jp/products/a0500mm?variant=37665260634273)が余っていたのでこれを使いました。

![キースイッチ](/img/2022-05-02/keyswitches.jpg)

 - キーキャップ: 6個
キーキャップには[TEX ADA -Film Never Dies-](https://talpkeyboard.net/items/5ecdd2fdcee9ea12129dbe11)を使いました。フィルムカメラがモチーフのノベルティキーキャップセットです。プロファイルはADAという、DSAよりも更に窪んだ形状をしており、打鍵音は低めで小さいように感じます。

![キーキャップ](/img/2022-05-02/keycaps.jpg)

 - USB micro-Bケーブル: 2本
片方がmicro-Bプラグであれば何でも良いです。\\
Macで開発するのでもう片方がUSB Type-Cプラグのものを使っています。
2本用意します。

![USB micro-Bケーブル](/img/2022-05-02/cable.jpg)

## 工具
RustyKeysを始め、自作キーボードキットの組み立てにははんだ付けが必要です。

必要な工具を1つずつ購入するのが面倒な方は、遊舎工房さんで購入可能な工具セット（全部入りセット）を買うのが良いでしょう。

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://shop.yushakobo.jp/products/a9900to" data-iframely-url="//iframely.net/c6MxuHh?card=small"></a></div></div>
~~~

この他には作業マット、マルチテスターもあると良いです。

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://amzn.to/3ydNMeK" data-iframely-url="//iframely.net/gMCVwHn?card=small"></a></div></div>

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://amzn.to/3vUUFPp" data-iframely-url="//iframely.net/yvvsOOs?card=small"></a></div></div>
~~~

### CAMPHOR- Make
2万円弱もかけて工具を一式揃えるのはちょっと...という学生に朗報です。\\
僕の所属している京都の学生ITコミュニティ[CAMPHOR-](https://camph.net)では、CAMPHOR- Makeというちょっとしたメイカースペースがあります。

<!-- textlint-disable ja-technical-writing/ja-no-mixed-period -->
上で紹介した工具は勿論、
<!-- textlint-enable ja-technical-writing/ja-no-mixed-period -->
- 温調ステーション型はんだごて
- はんだ吸煙器
- 絶縁断熱マット
- マルチテスター
など、自作キーボードに便利な工具が揃っています。

お近くにお住まいの方は是非お越しください。開館スケジュールは[こちら](https://camph.net/schedule)になります。\\
お待ちしております！

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://blog.camph.net/news/open-camphor-make/" data-iframely-url="//iframely.net/0YM0aeZ?card=small"></a></div></div>
~~~

## 本体の組み立て

RustyKeys本体の組み立てを行います。

### ダイオードのはんだ付け
ダイオードのリード線を曲げます。
今回は6個なので1つずつ曲げてもそれほど時間はかかりません。

大量のダイオードを曲げることがあるなら、Thingiverse等で[Diode bender](https://www.thingiverse.com/search?q=Diode+bender)と検索してダイオードをいい感じに曲げてくれる君の3Dモデルを手に入れ、3Dプリンタ[^make] で印刷すると良いでしょう。

![曲げダイオード](/img/2022-05-02/bended_diode.jpg)

基板に印刷された白い帯とダイオードに印刷された黒い帯が合うように、向きを確認して差し込みます。

![ダイオード](/img/2022-05-02/diodes.jpg)

マスキングテープ等で固定することで、はんだ付けがやり易くなります。

![マスキングテープ](/img/2022-05-02/maskingtape.jpg)

ダイオードのはんだ付けを行います。

![ダイオードのはんだ付け](/img/2022-05-02/soldered_diodes.jpg)

リード線の余った部分をペンチで切り落とします。切った際にどこかに飛んでいかないように、テープで繋げておくと良いです。

![リード線の除去](/img/2022-05-02/remove_lead_wires.jpg)

[^make]: 先程紹介した[CAMPHOR- Make](https://blog.camph.net/news/open-camphor-make/)には積層方式と光造形方式の3Dプリンタがあるので、是非ここで印刷してみては如何でしょうか。

### キースイッチのルブ

今回用いる[Kailh BOX Silent Pink](https://shop.yushakobo.jp/products/kailh-box-silent-switch)は押下圧が軽めで軸のぐらつきが少ない静音リニア軸です。
値段もそこまで高く無いので、安定して静音なキースイッチを求めている方にはお勧めです。

そのままでも静かなのですが、ルブることで更にノイズを軽減することが出来るので、やっておきます。
使用する潤滑剤は、リニアMXスイッチ用である[Krytox GPL 205 G0](https://shop.yushakobo.jp/products/lubricants?_pos=1&_sid=b3d9bc2ba&_ss=r&variant=37665260994721)です。

![ルブ](/img/2022-05-02/lube.jpg)

以下の3つを買っておけばとりあえずルブは出来ます。使用するキースイッチがリニア軸でない場合は[Tribosys 3204](https://shop.yushakobo.jp/products/lubricants?_pos=1&_sid=b3d9bc2ba&_ss=r&variant=37665260961953)が汎用的でお勧めです。

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://shop.yushakobo.jp/products/kbdfans-lube-tools-collection" data-iframely-url="//iframely.net/1f9BDql"></a></div></div>

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://shop.yushakobo.jp/products/kbdfans-x-ai03-2-in-1-%e3%82%a2%e3%83%ab%e3%83%9f%e3%83%8b%e3%82%a6%e3%83%a0%e3%82%b9%e3%82%a4%e3%83%83%e3%83%81%e3%82%aa%e3%83%bc%e3%83%97%e3%83%8a%e3%83%bc" data-iframely-url="//iframely.net/cvWLdnI?card=small"></a></div></div>

<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://shop.yushakobo.jp/products/lubricants" data-iframely-url="//iframely.net/bjXWf90"></a></div></div>
~~~

スイッチオープナーを用いてキースイッチを分解し、それぞれの部品で他の部品と擦れる場所にルブをしていきます。
今回は6つしかキーが無いので楽ですね。

![ルビング](/img/2022-05-02/lubing.jpg)

### ソケットのはんだ付け

[Mill-Max Socket](https://shop.yushakobo.jp/products/a0500mm?variant=37665260634273)をはんだ付けします。まずは全てのキースイッチにソケットを以下のように嵌めます。

![ソケット](/img/2022-05-02/sockets.jpg)

キースイッチを基板に差し込み、裏返してはんだ付けします。

![ソケットのはんだ付け](/img/2022-05-02/soldering_sockets.jpg)

キースイッチを外すとこんな感じになります。

![はんだ付けされたソケット](/img/2022-05-02/soldered_sockets.jpg)

### L字ピンヘッダのはんだ付け
L字ピンヘッダ（3ピン）をはんだ付けします。\\
固定せずにはんだ付けした為、ちょっと曲がってしまいました。ここもダイオードと同様にマスキングテープで固定しておくのが良さそうです。

![L字ピンヘッダ](/img/2022-05-02/l_pin_header.jpg)

### Raspberry Pi Picoのはんだ付け

Raspberry Pi Picoのはんだ付けを行います。本キットでは端面スルーホールではんだ付けを行うのですが、付属のピンヘッダを半分に切って差し込み、位置合わせを行います。

以下の図ように、手前は下から差し込み、奥は上から差し込むと、Raspberry Pi Picoがしっかりと固定されてはんだ付けしやすかったです。

![Raspberry Pi Picoのはんだ付け](/img/2022-05-02/soldering_pico.jpg)

片側がはんだ付け出来たら、ピンヘッダを外してもう一方とデバッグ用ピンのはんだ付けを行います。

![はんだ付けされたRaspberry Pi Pico](/img/2022-05-02/soldered_pico.jpg)

### ゴム足の取り付け
裏面にゴム足を取り付けます。四隅に白円が印刷されているので、それに合わせて貼り付けます。

![ゴム足](/img/2022-05-02/rubber_foot.jpg)

### キースイッチ、キーキャップの取り付け

キースイッチとキーキャップを取り付け、本体の組み立ては完了です。

![キースイッチとキーキャップの取り付け](/img/2022-05-02/set_keys.jpg)

## デバッグアダプタの組み立て

本体が組み立てられたので、次はデバッグアダプタを組み立てます。組み立てと言ってもピンヘッダをはんだ付けするだけです。

### ピンヘッダのはんだ付け
![デバッグアダプタ](/img/2022-05-02/debug_adapter.jpg)

デバッグに用いるピンは `GND`, `GP2`, `GP4` の3ピンのみなので、その部分（と固定のための `GP0`,`GP15`）をはんだ付けしておきました。

これでデバッグアダプタの組み立ては完了です。はんだ付けのフェーズは以上になります。

## ファームウェアの書き込み

現在、多くの自作キーボードキットは[QMK Firmware](https://github.com/qmk/qmk_firmware)というファームウェアに対応しています。
他に有名な設定ツールとして、QMK Firmware派生の[VIA](https://www.caniusevia.com), [Remap](https://remap-keys.app), [Vial](https://get.vial.today)などがあります。
Raspberry Pi PicoのようなRP2040チップであれば、CircuitPythonで記述出来る[kmk_firmware](https://github.com/KMKfw/kmk_firmware)やPicoRubyで記述出来る[prk_firmware](https://github.com/picoruby/prk_firmware)などを使えばキーボードとして動作します。

RustyKeysキットではこれらの既存のファームウェアを用いることなく、組み込みRustで開発します！\\
2022/5/2現在、[**作者様の名前が入力可能な最高のキーボード**](https://rusty-keys.koba789.com/firmware/first_keyboard)まではビルドガイドに含まれていますのでそこまでやってみましょう。

自分の開発環境は以下の通りです。
```sh
❯ uname -a
Darwin mbp2019.local 21.4.0 Darwin Kernel Version 21.4.0: Fri Mar 18 00:45:05 PDT 2022; root:xnu-8020.101.4~15/RELEASE_X86_64 x86_64
```

### 必要なツールのインストール
ビルドガイド通りに作業していればもう済んでいることかと思いますが、必要な環境及びツールは[ビルドガイド](https://rusty-keys.koba789.com/devenv)を参考にインストールしておきましょう。
```sh
# Install Rust
❯ curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# ...or Update Rust
❯ rustup update

# Add thumbv6m-none-eabi target
❯ rustup target add thumbv6m-none-eabi

# Install probe-run
❯ cargo install probe-run
# Install flip-link
❯ cargo install flip-link
# Install elf2uf2-rs
❯ cargo install elf2uf2-rs
```

### デバッグアダプタのファームウェア
[rust-dap](https://github.com/ciniml/rust-dap)をデバッグアダプタに書き込みます。
デバッグアダプタ用のRaspberry Pi Picoと開発用PCをUSBケーブルで接続し、以下を実行します。

```sh
❯ git clone https://github.com/ciniml/rust-dap.git
❯ cd boards/xiao_rp2040
❯ cargo run --release
```

### 本体のファームウェア
ジャンパ線で本体とデバッグアダプタを接続します。対応は以下です。

| 本体側ピン | デバッグアダプタ側ピン |
| :-- | :-- |
| SWDIO | GP4（GPIO4） |
| GND | GND |
| SWCLK | GP2（GPIO2） |

デバッグアダプタ -> 本体の順に、2本のUSBケーブルで開発用PCに接続します。

ファームウェアのサンプルコードは[rusty-keys](https://github.com/KOBA789/rusty-keys)の `firmware` 下に用意されているので、cloneします。

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://github.com/KOBA789/rusty-keys" data-iframely-url="//iframely.net/PaLazB8?card=small"></a></div></div>
~~~

```sh
❯ git clone https://github.com/KOBA789/rusty-keys.git
❯ cd rusty-keys
```

#### firmware/hello
デバッグ出力に `Hello, world!` を出力するサンプルコードです。

```sh
❯ cd firmware/hello/
❯ cargo run
```

```sh
    Finished dev [unoptimized + debuginfo] target(s) in 35.00s
     Running `probe-run --chip RP2040 target/thumbv6m-none-eabi/debug/rusty-keys-hello`
(HOST) INFO  flashing program (6 pages / 24.00 KiB)
(HOST) INFO  success!
────────────────────────────────────────────────────────────────────────────────
Hello, world!
└─ rusty_keys_hello::__cortex_m_rt_main @ src/main.rs:21
────────────────────────────────────────────────────────────────────────────────
(HOST) INFO  device halted without error
```

表示されたことが確認出来ました。[`probe-run`](https://github.com/knurling-rs/probe-run) 凄い...。
動作を見ると分かりますが、書き込みはprobe（デバッグアダプタ）を通して行われているようですね。

#### firmware/keyboard
USBキーボードのサンプルコードです。

[`src/bin/sample.rs`](https://github.com/KOBA789/rusty-keys/blob/main/firmware/keyboard/src/bin/simple.rs)に `k` `o` `b` `a` `7` `8` `9` や修飾キーなどが入力出来るようになるサンプルコードがあります。

```sh
❯ cd ..
❯ cd keyboard/
❯ cargo run --release --bin simple
```

```sh
    Finished release [optimized + debuginfo] target(s) in 33.94s
     Running `probe-run --chip RP2040 target/thumbv6m-none-eabi/release/simple`
(HOST) INFO  flashing program (8 pages / 32.00 KiB)
(HOST) INFO  success!
────────────────────────────────────────────────────────────────────────────────
```

作者様の名前が入力可能な最高のキーボードが完成しました🎉

![作者様の名前が入力可能な最高のキーボード](/img/2022-05-02/out.gif)

~~~
<blockquote class="twitter-tweet" data-theme="dark" data-dnt="true" align="center"><p lang="ja" dir="ltr">RustyKeysできた。Mil-Max Socketが余っていたのでホットスワップ化した <a href="https://t.co/TLHjC9G9Fi">pic.twitter.com/TLHjC9G9Fi</a></p>&mdash; へいほぅ (@h3y6e) <a href="https://twitter.com/h3y6e/status/1520812444519911425?ref_src=twsrc%5Etfw">May 1, 2022</a></blockquote>
~~~
