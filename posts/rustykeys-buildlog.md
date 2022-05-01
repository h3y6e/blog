+++
title = "RustyKeys ビルドログ"
date = Date(2022,05,02)
tags = ["keyboard", "buildlog"]
rss_description =  "RustyKeysのビルドログです。"
cover = "/img/2022-05-02/rustykeys.jpg"
+++

~~~
<script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>
~~~

## はじめに

~~~
<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe src="https://www.youtube.com/embed/7Rn1n0EEcfo?rel=0&cc_load_policy=1" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"></iframe></div>
~~~

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://github.com/KOBA789/rusty-keys" data-iframely-url="//iframely.net/PaLazB8?card=small"></a></div></div>
~~~

## RustyKeysの特徴

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://shop.yushakobo.jp/products/4256" data-iframely-url="//iframely.net/6Ud2SnE?card=small"></a></div></div>
~~~

 - フットプリントが名刺サイズ（91mm x 55mm）
 - 公式のビルドガイド（本ガイド）が組込みRustをサポートしている
 - キーボードを「使いたい人」向けではなく「作りたい人」向け
   - 本商品は、組み立て・プログラミング自体を楽しむことを目的としたキットです
 - 組み立てが簡単で、はんだ付け入門としてもおすすめ

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
キーキャップには[TEX ADA -Film Never Dies-](https://talpkeyboard.net/items/5ecdd2fdcee9ea12129dbe11)を使いました。フィルムカメラがモチーフのノベルティキーキャップセットです。プロファイルはADAという、DSAよりも更に抉れた形状をしており、小さい打鍵音が特徴です。

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

大量のダイオードを曲げるのは多少面倒なので、Thingiverse等で[Diode bender](https://www.thingiverse.com/search?q=Diode+bender)と検索してダイオードをいい感じに曲げてくれる君の3Dモデルを手に入れ、3Dプリンタ[^make] で印刷すると良いでしょう。

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

そのままでも十分静かなのですが、ルブることで更にノイズを軽減することが出来るので、やっておきます。
今回使用する潤滑剤は、リニアMXスイッチ用である[Krytox GPL 205 G0](https://shop.yushakobo.jp/products/lubricants?_pos=1&_sid=b3d9bc2ba&_ss=r&variant=37665260994721)です。

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

キースイッチを抜くとこんな感じになります。

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
