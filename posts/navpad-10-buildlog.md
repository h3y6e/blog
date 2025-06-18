+++
title = "Navpad 1.0 ビルドログ"
date = Date(2022,03,15)
tags = ["keyboard", "buildlog", "yushakobo_guild"]
rss_description =  "遊舎工房様より提供していただいたNavpad 1.0のビルドログです。"
cover = "/img/2022-03-15/navpad_10_rev1_red.jpg"
+++

## はじめに

本稿は遊舎工房ギルドの活動によるものです。
遊舎工房ギルドの詳細については以下を参照してください。

{{ embed https://yushakobo.jp/news/2022/02/23/guild/ }}

遊舎工房ギルド本部から[Navpad 1.0](https://shop.yushakobo.jp/products/3685?variant=42393049497831)と[Aluminum feetセット](https://shop.yushakobo.jp/products/3685?variant=42393049530599)を提供していただきました。ありがとうございます🙇

## Navpad 1.0の特徴

{{ embed https://shop.yushakobo.jp/products/3685 }}

このキーボードは、アルファベットや記号が打てる"普通の"キーボードとは違い、フルキーボードのnavigation clusterとnumpadのみを切り出したキーパッドです。\\
自作キーボードでは40%や60%などのコンパクトなキーボードが好まれているように思うのですが、3DCG制作ソフトウェアなどではテンキー等を欲しくなることが多いです。
その時に使えそうですね。\\
また、最近の自作キーボードキットにはよくあるロータリーエンコーダもちゃんと搭載可能なのが嬉しいです。

## ビルドガイド
ビルドガイドは以下になります。**作業の前に、必ず一読するようにしましょう。**

{{ embed https://github.com/yushakobo/build-documents/blob/master/Navpad_10/readme.md "yushakobo/build-documents/readme.md" }}

## 内容物の確認
まずは内容物の確認をします。不足があっても1週間以内であれば対応していただけるので、届いたら早めに確認しましょう。

今回はキーボードキットだけでなくAluminum feetセットもあるので、2つの袋があります。

![2つの袋](/img/2022-03-15/two_pouches.jpg)

### キーボードキット
内容物は以下のようになっています。

![キット](/img/2022-03-15/keyboard_kit.jpg)

- PCB: 1枚
- トッププレート: 1枚
- ボトムプレート: 1枚
- ダイオード: 36個
- ProMicro: 1個
- ピンヘッダ: 2本
- タクトスイッチ: 1個
- M2 4mmネジ: 22本
- M2 7mmスペーサー: 9個
- M2 5mmスペーサー: 2個
- ゴム脚: 4個

Aluminum feetセットを使う場合、M2 7mmスペーサーは使用しません。

### Aluminum feetセット
内容物は以下のようになっています。

![チルト用 Aluminum feet セット](/img/2022-03-15/aluminum_feet_kit.jpg)

- M2 8mmスペーサー: 9個
- M4 6mmスリムヘッド小ねじ: 2個
- Anodized CNC Aluminum Feet: 1セット

この内、写真に写っている白いシールは使用しません。

## 自分で用意するもの
### 必須
- キースイッチ
今回は[Gateron Ink Blue](https://shop.yushakobo.jp/collections/all-switches/products/gateron-ink-switches?variant=37665670299809)を用いました。
何気にクリッキーな軸でキーボードを組むのは初めてです。

![キースイッチ](/img/2022-03-15/gateron_ink_blue.jpg)

- キーキャップ
キーキャップには[DSA LightCycle - Freedom For The Users](https://shop.yushakobo.jp/products/dsa-lightcycle?variant=37665700970657)を使いました。
色合いがとても好きでお気に入りのキーキャップです。

![キーキャップ](/img/2022-03-15/keycaps.JPG)

### オプション

- コンスルー: 2本
ProMicroの取り付けに用います。もげ対策済みProMicro[^もげMicro] とコンスルーが余っていたので今回はそれを用いました。

- スタビライザー 2Uサイズ: 3個
`0` キー、`+` キー、`Enter` キーを2Uで使うために必要です。
[MXスイッチ スタビライザー](https://shop.yushakobo.jp/products/a0500st?variant=37665699430561)を使いました。

![スタビライザー](/img/2022-03-15/stab.jpg)

- LED（SK6812MINI-E）: 9個
[SK6812MINI-E](https://shop.yushakobo.jp/products/sk6812mini-e-10)です。
[SK68912MINI](https://shop.yushakobo.jp/products/sk6812mini-10)とのピン互換は無いので注意してください。

![LED](/img/2022-03-15/led.jpg)

- ロータリーエンコーダ: 1個
- ロータリーエンコーダ用ノブ: 1個

Amazonで適当に買ったやつを使いました。

[^もげMicro]: [もげ予防 - Self-Made Keyboards in Japan](https://scrapbox.io/self-made-kbds-ja/%E3%82%82%E3%81%92%E4%BA%88%E9%98%B2) を参照。

## 組み立て
### ダイオードのはんだ付け
付属のダイオードは表面実装ではなくリード線のあるものです。
向きを確認して差し込み、マスキングテープ等で固定します。
![ダイオード](/img/2022-03-15/diode.jpg)

![マスキングテープ側](/img/2022-03-15/maskingtape.jpg)

はんだ付けをしていきます。

![ダイオード はんだ付け](/img/2022-03-15/solder_diodes.jpg)

全てのダイオードのはんだ付けが完了したら、リード線をペンチで取り除きます。
セロハンテープ等でリード線を纏めておけば、散らばることが無い為おすすめです。

![ダイオード リード線除去](/img/2022-03-15/remove_lead_wire.jpg)

### リセットスイッチのはんだ付け

基盤右上の `Reset` にタクトスイッチをはんだ付けします。

![リセットスイッチ](/img/2022-03-15/reset_switch.jpg)

### ProMicroの取り付け
前述したように、もげ対策済みProMicroが余っていたのでそれを付けます。コンスルーを用いているので差し込むだけです。

![ProMicro](/img/2022-03-15/promicro.jpg)

### LEDのはんだ付け

はんだごてを270℃以下に設定し、LEDを取り付けます。
今まで[SK6812MINI](https://shop.yushakobo.jp/products/sk6812mini-10/)などの足が無いものを扱っていた為、足付きのはんだ付けのしやすさに驚きました。

また、LEDが正常に動作するかを確認するため、この段階でファームウェアを書き込みます。今回は[QMK Toolbox](https://github.com/qmk/qmk_toolbox)を用いました。

![QMK Toolbox](/img/2022-03-15/qmk_toolbox.png)

![LEDの確認](/img/2022-03-15/check_leds.JPG)

### プレートの準備

ProMicroカバーとロータリーエンコーダカバーを外します。

![プレート](/img/2022-03-15/plate.jpg)

### キースイッチ、ロータリーエンコーダの取り付け

Gateron Ink Blueを取り付けます。\\
`0` キー、`+` キー、`Enter` キーを2Uで使う為、スタビライザーも用意します。

![キースイッチ](/img/2022-03-15/set_keyswitches.jpg)

スタビライザーをルブして、取り付けます。

![ルブ](/img/2022-03-15/lub.jpg)

ロータリーエンコーダとキースイッチをはんだ付けします。

![ロータリーエンコーダ](/img/2022-03-15/rotary_encoder.jpg)

![はんだ付け](/img/2022-03-15/soldering.jpg)

### ProMicroカバーの取り付け

![カバー取り付け](/img/2022-03-15/cover_mounting.jpg)

### ボトムプレート、Aluminum feetの取り付け

今回は[チルト用Aluminum feetセット](https://shop.yushakobo.jp/products/3685?variant=42393049530599)を使用します。

ビルドガイドは以下になります。

{{ embed https://github.com/yushakobo/build-documents/blob/master/Navpad_10/formore/aluminum_feet.md yushakobo/build-documents/aluminum_feet.md }}

![ボトムプレート](/img/2022-03-15/bottom_plate.jpg)

![aluminum feet](/img/2022-03-15/aluminum_feet.jpg)

## 完成
![完成](/img/2022-03-15/kansei.jpg)

![完成2](/img/2022-03-15/navpad_10_rev1_red.jpg)

キーキャップ、キースイッチが青系なのでいい感じに収まったのではないかと思います。

ロータリーエンコーダで音量を調節できるの便利ですね。次組むキーボードはロータリーエンコーダ付きのものにしようかな。
