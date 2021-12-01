+++
title = "【ポケモンBDSP】自動孵化装置を作って高個体値色違いイーブイを手に入れる(夢を見た)"
date = Date(2021,12,1)
tags = ["camphor", "adventcalendar", "automation", "pokemon"]
rss_description = "Pro Micro(Arduino Leonardo互換機)でポケモンBDSP版自動孵化装置を作成する。"
cover = "/img/2021-12-01/6v.jpg"
+++

この記事は、[CAMPHOR- Advent Calendar 2021](https://advent.camph.net/)の2日目の記事です。


## tl;dr

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">ATmega32U4で 孵 化 厳 選 <a href="https://t.co/iIxeC5RUdw">pic.twitter.com/iIxeC5RUdw</a></p>&mdash; へいほぅ (@5ebec) <a href="https://twitter.com/5ebec/status/1461719540379774982?ref_src=twsrc%5Etfw">November 19 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~


## はじめに
こんにちは、[へいほぅ](https://twitter.com/5ebec)です。[CAMPHOR-](https://camph.net/)の運営メンバーです。

皆さん『ポケットモンスター ブリリアントダイヤモンド・シャイニングパール』（以下、ポケモンBDSP）遊んでらっしゃいますでしょうか。
待ちに待ったダイパリメイクであり、望まれたバグ以外のあらゆるバグが実装されてしまったことで話題となっていますが、それらも含めて楽しく遊ばれていることと思います。

本稿ではArduino Leonardo互換機である[Pro Micro](https://shop.yushakobo.jp/products/pro-micro)を用い、ポケモンBDSP自動孵化装置を作成します。\
なお本稿は任天堂の許諾を受けていない周辺機器の使用を推奨するものではありません。

## ドメイン知識: タマゴ
ポケモンのメインシリーズをやったことのある人でも、タマゴや孵化の仕様について深く知らない方も多いのではないでしょうか。\
シリーズ全体でのタマゴに関しては
[タマゴ - ポケモンWiki](https://wiki.xn--rckteqa2e.com/wiki/%E3%82%BF%E3%83%9E%E3%82%B4)
や
[The Breeding Guide Part II - Smogon University](https://www.smogon.com/ingame/guides/breeding_guide_part2#hatching_eggs)
が、『ポケットモンスター ダイヤモンド・パール』（以下、ポケモンDP）におけるタマゴに関しては
[タマゴ - ポケットモンスターダイヤモンド、パール攻略Wiki](https://w.atwiki.jp/pokemondp/pages/205.html)
が詳しいです。以下ではポケモンBDSPで自動孵化装置を作成するにあたり必要な知識のみを説明します。

### タマゴが見つかる条件
預かり屋に2匹のポケモンを預けると、255歩毎[^歩数] に以下の確率でタマゴが見つかります。
詳しくは述べませんが、預けるポケモンの種類やIDに依存し、預かり屋じいさんの台詞が変化します。
- 「2匹の　仲は　とっても　良いようじゃ」: $70\%$
- 「2匹の　仲は　まずまずの　ようじゃ」: $50\%$
- 「2匹の　仲は　それほど　良くないがなぁ」: $20\%$
- 「お互いに　違う　ポケモン達と　遊んでおるがなぁ…」: $0\%$

![mazumazu](/img/2021-12-01/mazumazu.jpg)

[まるいおまもり](https://wiki.xn--rckteqa2e.com/wiki/%E3%81%BE%E3%82%8B%E3%81%84%E3%81%8A%E3%81%BE%E3%82%82%E3%82%8A) を持っていると早くタマゴが見つかるようです。
正確な確率は不明ですが、経験的に20%ほど見つかる確率が上がります。

[^歩数]: ポケモンBDSPにおいて要検証。

### タマゴのサイクル数
タマゴが孵化するまでの歩数に関与する隠しステータスで、ポケモンの種類ごとに数値が決まっています。\
例えばコイキングは5、イーブイは35です。

![oya](/img/2021-12-01/oya.jpg)


ポケモンDP及びBDSPでは通算歩数[^通算歩数] **255**歩毎に1減り、サイクル数が0であるとき、タマゴが孵ります。
ただし、孵化を早める特性（『ほのおのからだ』『マグマのよろい』等）を持つポケモンが手持ちにいる場合はサイクル数が2減ります。

例えばイーブイ（サイクル数35）のタマゴを孵化させたいとき、手持ちに特性『マグマのよろい』を持つマグカルゴがいれば、孵化に必要な歩数は
$$
\left\lceil \frac{35}{2} \right\rceil \times 255 = 4590\ {\rm steps}
$$
となります。

[^通算歩数]: [ポケモンWiki](https://wiki.xn--rckteqa2e.com/wiki/%E3%82%BF%E3%83%9E%E3%82%B4)より引用:『タマゴ1個ごとに何歩歩いたかがカウントされている訳ではなく、主人公の通算の歩数がチェック周期の倍数を回るたびに一括でチェックが入り、「前回のチェックの時点でも手持ちにあったタマゴ」全てのサイクル数の値を1マイナスする』

### 廃人ロード

メインシリーズには [廃人ロード](
https://dic.nicovideo.jp/a/%E5%BB%83%E4%BA%BA%E3%83%AD%E3%83%BC%E3%83%89) と俗称される、育て屋/預かり屋周辺に整備された道路があります。
ポケモンDP及びBDSPにも廃人ロードは用意されており、209番道路⇔ズイタウン⇔210番道路の往復**254**歩の道です。

### 参考: ダイヤモンドダスト
ポケモンDPでは、年に数回キッサキシティでダイヤモンドダストの降る日が年に数回あります。この日に限り、サイクル数を減少させる歩数は255歩でなく230歩になります。\
ポケモンBDSPにおいてもダイヤモンドダストは存在するようですが、狙って出すためには日付を弄る必要がある[^時渡り] ため今回は考慮にいれません。

[^時渡り]: 単に特定の日付にすれば良いというわけではなく、2日以上（24時間1分以上）前に設定してから時間を経過させる必要があるらしい。未検証。

## ドメイン知識: Nintendo Switchコントローラー
ご存知のように、Nintendo Switchは本体のUSB Type-C端子に接続することでコントローラーを用いることが出来ます。
ここでは有線接続によるコントローラについて解説します。

### USB HID
Nintendo Switchのコントローラは[USB HID](https://www.usb.org/hid)（Human Interface Devices）による通信をサポートしています[^参考]。

USB HIDはコンピュータ周辺機器のUSB仕様の1つで、キーボードやマウスなどのデバイスを規定するものです。
現在のHIDデバイスは幅広いデバイスが含まれており、様々なハードウェアベンダがHIDを採用しています。

HIDクラスでは、レポートと呼ばれる単位でデータを転送します。
Report DescriptorによってUSBデバイスにUSBホストがパケット構造を定義することが出来ます。
参考までに、以下にNintendo Switchのコントローラとして認識するReport Descriptorを記載します。

```julia
item                                | hex
-----------------------------------------------------
USAGE_PAGE (Generic Desktop)        | 0x05 0x01
USAGE (Game Pad)                    | 0x09 0x05
COLLECTION (Application)            | 0xa1 0x01
  LOGICAL_MINIMUM (0)               | 0x15 0x00
  LOGICAL_MAXIMUM (1)               | 0x25 0x01
  PHYSICAL_MINIMUM (0)              | 0x35 0x00
  PHYSICAL_MAXIMUM (1)              | 0x45 0x01
  REPORT_SIZE (1)                   | 0x75 0x01
  REPORT_COUNT (16)                 | 0x95 0x10
  USAGE_PAGE (Button)               | 0x05 0x09
  USAGE_MINIMUM (1)                 | 0x19 0x01
  USAGE_MAXIMUM (16)                | 0x29 0x10
  INPUT (Data,Var,Abs)              | 0x81 0x02
  USAGE_PAGE (Generic Desktop)      | 0x05 0x01
  LOGICAL_MAXIMUM (7)               | 0x25 0x07
  PHYSICAL_MAXIMUM (315)            | 0x46 0x3b 0x01
  REPORT_SIZE (4)                   | 0x75 0x04
  REPORT_COUNT (1)                  | 0x95 0x01
  UNIT (20)                         | 0x65 0x14
  USAGE (Dpad Switch)               | 0x09 0x39
  INPUT (Data,Var,Abs)              | 0x81 0x42
  UNIT (0)                          | 0x65 0x00
  REPORT_COUNT (1)                  | 0x95 0x01
  INPUT (Cnst,Arr,Abs)              | 0x81 0x01
  LOGICAL_MAXIMUM (255)             | 0x26 0xff 0x00
  PHYSICAL_MAXIMUM (255)            | 0x46 0xff 0x00
  USAGE (X)                         | 0x09 0x30
  USAGE (Y)                         | 0x09 0x31
  USAGE (Z)                         | 0x09 0x32
  USAGE (Rz)                        | 0x09 0x35
  REPORT_SIZE (8)                   | 0x75 0x08
  REPORT_COUNT (4)                  | 0x95 0x04
  INPUT (Data,Var,Abs)              | 0x81 0x02
  USAGE_PAGE (Vendor Defined 65280) | 0x06 0x00 0xff
  USAGE (32)                        | 0x09 0x20
  REPORT_COUNT (1)                  | 0x95 0x01
  INPUT (Data,Var,Abs)              | 0x81 0x02
  USAGE (9761)                      | 0x0a 0x21 0x26
  REPORT_COUNT (8)                  | 0x95 0x08
  OUTPUT (Data,Var,Abs)             | 0x91 0x02
END_COLLECTION                      | 0xc0
```

[^参考]: [dekuNukem/Nintendo\_Switch\_Reverse\_Engineering: A look at inner workings of Joycon and Nintendo Switch](https://github.com/dekuNukem/Nintendo_Switch_Reverse_Engineering) [USB HIDクラス ‐ 通信用語の基礎知識](https://www.wdic.org/w/TECH/USB%20HID%20%E3%82%AF%E3%83%A9%E3%82%B9)


### ATmega32U4
~~~
<figure>
  <img src="/img/2021-12-01/promicro.jpg"/>
  <figcaption>Pro Micro。中央のマイクロコントローラがATmega34U4。</figcaption>
</figure>
~~~

ATmega32U4マイコンにはHID機能があるため、ATmega32u4を搭載したPro MicroはNintendo Switchコントローラとして動作します。
Arduinoの[HID library](https://www.arduino.cc/en/Reference/HID)を用いれば、コントローラを実装できます。

## 実装

全てのコードは下記リポジトリにあります。

~~~
<div class="iframely-embed"><div class="iframely-responsive" style="height: 140px; padding-bottom: 0;"><a href="https://github.com/5ebec/birdo" data-iframely-url="//cdn.iframe.ly/JgnZlBb?card=small"></a></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>
~~~

Arduino Libraryとして、MIT License下にある [celclow/SwitchControlLibrary](https://github.com/celclow/SwitchControlLibrary) を改変したものを利用させていただいております。

### 方針
Arduinoスケッチとしてinoファイルに記述するコードは、押すボタンを時間で管理しているだけなので大したものでは無いです。

0. 初期位置に移動する
1. タマゴを30回受け取りボックスに送る
2. ボックス1個分を孵化させる
   1. 1列分のタマゴを手持ちに入れる
   2. 廃人ロードを往復する
   3. 孵化したらボックスを開き手持ちを入れ替える
3. 1.に戻る

これを実装します。\
出来るだけ早くサイクルを回せて、かつ安定して動作し続けることを目指しています。

### 初期位置に移動する
HIDデバイスから同じ入力を与えていても、ホスト側の状態によって入力にズレが生じます。
安定した動作のためには、定期的に初期位置に戻る必要があります。

初期位置をポケモンセンター前と定義すれば「そらをとぶ」を利用することで必ず同じ場所に戻ることが出来ます。
今回は廃人ロード最南（209番道路側の突き当り）を初期位置として採用しました。
これは多少X座標がずれていても看板・NPC・坂道によって廃人ロード上に乗るように補正され、また「そらをとぶ」にかかる時間よりも自転車で南下する時間のほうが短い為です。
```cxx
void moveToInit() {
  // メニューを開く
  pushButton(X, 500);
  // 「タウンマップ」を押す
  tiltLeftJoystick(-100, -100, 1000);
  // マップ画面が開くまで待機
  pushButton(A, 1100);
  // ズイタウン を選択する
  pushButton(A, 700);
  // 「はい」を押し、ポケモンセンター前に移動するまで待機
  pushButton(A, 7000);
  // 初期位置に移動
  tiltLeftJoystick(-100, 0, 600);
  rideBike();
  tiltLeftJoystick(0, 100, 5300);
}
```

### タマゴを受け取る
先に述べたようにタマゴを受け取れるかどうかは確率なので、タマゴが受け取れない場合も考えて実装する必要があります。
タマゴが受け取れるときは以下のように会話が進みます。A/Bボタン14回で会話が終了します。
```
*   おお！　あんたか
*   預かっていた　ポケモンを　世話して　おったら……　なんと！
*   ポケモンが　タマゴを　持っておったんじゃ！
*   どこから　持ってきたか　わからんが　あんたの　ポケモンが　持っていた
*   タマゴなんじゃ
*   やっぱり　欲しいじゃろ？
*   [はい]
*   へいほぅは　預かり屋　じいさんから　
*   タマゴを　もらった！
*   「タマゴを　ボックスへ　送信しました！」
*   大事に　育てなさいよ！
```
タマゴを受け取れないときは以下のように会話が進みます。A/Bボタン4回で会話が終了します。
```
*   おお　あんたか！　よく来たな
*   [ポケモン]と　[ポケモン]は　元気じゃぞ！
*   2匹の　仲は とっても 良いようじゃ
*         or まずまずの　ようじゃ
*         or それほど　良くないがなぁ
```
また、会話中でないときはBボタンを押すと自転車のギアチェンジを行ってしまう為、ギアを4速に戻すためBボタンを偶数回押す必要があります。
従って、Aボタンを12回、Bボタンを2回押せばどちらの状況にも対応出来ます。
```cxx
void getEgg() {
  // 話し掛ける
  pushButton(A, 400, 4);
  pushButton(B, 400, 2);
  pushButton(A, 400, 4);
  flash(7);
  pushButton(A, 600, 2);
  pushButton(A, 400, 2);
}
```

### 廃人ロードを往復する
往復254歩、所要時間20800msです。
```cxx
void roundTrip(int times) {
  for (int i = 0; i < times; i++) {
    tiltLeftJoystick(0, -100, 10400);  // 127歩
    tiltLeftJoystick(0, 100, 10400);   // 127歩
  }
}

void hatch() {
  // ⌈EGG_CYCLE / 2⌉ * 254歩
  roundTrip((EGG_CYCLE + 1) / 2);
  tiltLeftJoystick(0, -100, 10400);
  for (int i = 0; i < 5; i++) {
    pushButton(A, 200, 2);
    flash(76);
    pushButton(A, 5000);
  }
}
```

### ボックスを操作する
ポケットモンスター ソード・シールドに対しても同様の実装をしていたのですが、それと比べて全体的に動作が遅く、1操作あたり50msほど増やさないと安定しませんでした。

#### 手持ちのポケモンをボックスに預ける
```cxx
void sendToBox(int column) {
  /* 手持ちの孵化したポケモンを範囲選択してボックスの指定列に移す */
  // 「はんい」モードにする
  pushButton(Y, 100, 2);
  // ポケモンの2匹目にカーソルを当てる
  pushDpad(LEFT, 200);
  pushDpad(DOWN, 100);
  // 手持ちのポケモン5匹を範囲選択する
  pushButton(A, 100);
  pushDpad(DOWN, 50, 100, 3);
  pushDpad(DOWN, 150);
  // 選択したポケモンを持ち上げる
  pushButton(A, 150);
  // 指定列にポケモンを移動させる
  pushDpad(UP, 100);
  if (column < 3) {
    pushDpad(RIGHT, 50, 100, column + 1);
  } else {
    pushDpad(LEFT, 50, 100, 6 - column);
  }
  pushButton(A, 150);
}
```

#### 手持ちに入れる
```cxx
void returnFromBox(int column) {
  // ポケモン5匹を範囲選択する
  pushButton(A, 100);
  pushDpad(DOWN, 50, 100, 3);
  pushDpad(DOWN, 150);
  // 選択したポケモンを持ち上げる
  pushButton(A, 150);
  // 手持ちにポケモンを移動する
  pushDpad(DOWN, 100);
  if (column < 3) {
    pushDpad(LEFT, 50, 100, column + 1);
  } else {
    pushDpad(RIGHT, 50, 100, 6 - column);
  }
  pushButton(A, 600);
}
```

#### ボックスを入れ替える
```cxx
void swapBox(int box) {
  // ボックス一覧
  pushDpad(UP, 150);
  pushDpad(UP, 100);
  pushDpad(LEFT, 100);
  pushButton(A, 500);
  // 1番目と2番目を入れ替え
  pushButton(Y, 100);
  pushDpad(RIGHT, 50);
  pushButton(Y, 100);
  if (box > 2) {
    // 1番目とbox番目を入れ替え
    pushDpad(LEFT, 50);
    pushButton(Y, 150);
    if (box < 4) {
      pushDpad(RIGHT, 50, 100, box - 1);
    } else {
      pushDpad(LEFT, 50, 100, 7 - box);
    }
    pushButton(Y, 100);
  }
  pushButton(B, 400);
}
```

## 結果
色違いイーブイは出ませんでした。いや $1/4096\approx0.02\%$ なんて引けねえよ。

## おわりに
イーブイの孵化余りが大量にいるので、欲しい方がいらっしゃいましたら渡します。\
代わりにムンボor海外産イーブイが欲しいです。誰かください。

![6v eevee](/img/2021-12-01/6v.jpg)
