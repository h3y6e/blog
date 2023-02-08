+++
title = "Nostrを用いてblogとmicrobloggingの中間的存在が作れるのでは無いか、という思考と実験"
date = Date(2023, 02, 08)
tags = ["nostr", "blog"]
rss_description = "Comment on Nostrをこのブログに試験的に導入してみる。"
+++

~~~
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

経緯: [note1mujewncmefzs0xgz7u8mmcz36a85du63hc2lulgj690xdtyn8z5s9vgt5e](https://iris.to/#/post/note1mujewncmefzs0xgz7u8mmcz36a85du63hc2lulgj690xdtyn8z5s9vgt5e)

## はじめに
何故か日本で[Nostr](https://github.com/nostr-protocol/nostr)が流行った。

僕がNostrを知ったのは12月くらいで、"post-Elon Twitterが敵対しているSNS"という雑な認識をしていた。
自分の初めの投稿は去年の12/19らしい。
[note1x2tv7h06xh3rgmkas85cxq36m3dk24mrpsw00xus5l44y0husjzs5c4lva](https://iris.to/#/post/note1x2tv7h06xh3rgmkas85cxq36m3dk24mrpsw00xus5l44y0husjzs5c4lva) [^余談]

特に日本語が流れている様子もなかったのでその後開くこともなかったが、何やら最近日本人が参入し始めたらしいということを何かの記事で知った。
再び開いてみたら、一方的に認知している人々が複数人いたので再開した。

Nostrについて、改めて調べてみるとなかなかどうして愉快なプロトコルじゃあないかと思い、自分で色々リレーサーバを立ててみたり、[NIP - Nostr Implementation Possibilities](https://github.com/nostr-protocol/nips)と呼ばれる仕様書を読んだりした。

{{ embed https://github.com/nostr-protocol/nips nips }}

Nostrやその周辺知識は[このScrapbox](https://scrapbox.io/nostr/)が纏まっていて分かりやすい。そのため本稿では説明は割愛する。

{{ embed https://scrapbox.io/nostr/ }}

Nostrに対する僕の雑な感想。

~~~
<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">よくこんなんでTwitterと比較される立場になろうと思ったな、という実装をしていて凄い</p>&mdash; へいほぅ (@h3y6e) <a href="https://twitter.com/h3y6e/status/1623003272700211201?ref_src=twsrc%5Etfw">February 7, 2023</a></blockquote>
~~~

Nostrでの雑な投稿。: [note1u3n78mf3efdqswl289qqrm635y8ym65fk89ktruwl6e4nzarvl5qarkvmj](https://iris.to/#/post/note1u3n78mf3efdqswl289qqrm635y8ym65fk89ktruwl6e4nzarvl5qarkvmj)

[^余談]: 余談だが、投稿内容を確認しに行くのが面倒なのでTwitterみたいに投稿を埋め込むかOGP対応したい。[nostr.guru](https://nostr.guru)あたりでやりたい。

## blogとmicrobloggingの中間？

[blog](https://ja.wikipedia.org/wiki/%E3%83%96%E3%83%AD%E3%82%B0)は、それ自体で様々なものを表しmicrobloggingはblogの部分集合ではあるが、ここでは本ウェブページのようなある程度纏まった文章の集合物を指すものとする。
[microblogging](https://ja.wikipedia.org/wiki/%E3%83%9F%E3%83%8B%E3%83%96%E3%83%AD%E3%82%B0)とは一般的にはTwitterや[mixiボイス](https://mixi.jp/help.pl?mode=item&item=558)、[Misskey](https://misskey-hub.net/), [Mastodon](https://joinmastodon.org/)などの自分の状況や雑記を投稿するウェブサービスのことを表す。

見てもらえば分かるように、僕はあまりblogを更新することが無い一方、microbloggingのほうは好きで幾つかのインターネット上の人格を持ちながら続けている。
しかしmicrobloggingでは収集性が無いというか、後から振り返りたい時に散らかり過ぎている。
例えばTwitterでは[ツイセーブ](https://twisave.com)というログ保存サービスを利用しているが、これも[Twitter APIが有料化する](https://twitter.com/TwitterDev/status/1621026986784337922)とかなんとかで続くようには思えない。

~~~
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Starting February 9, we will no longer support free access to the Twitter API, both v2 and v1.1. A paid basic tier will be available instead 🧵</p>&mdash; Twitter Dev (@TwitterDev) <a href="https://twitter.com/TwitterDev/status/1621026986784337922?ref_src=twsrc%5Etfw">February 2, 2023</a></blockquote>
~~~

blogを雑記として利用出来ないのはテキストを書くことが特段嫌いだがらというわけではなく、blogという形式が自分に合っていないからではないかと思っている。

じゃあその良いとこ取りをしたような構造があれば良いのでは？という思考。

### 求めているもの

- 投稿者（自分）側
  - 週報くらいの感覚で投稿したい。
  - それに対してなにかしらの反応を得たい。
  - ソーシャルグラフが可視化できればなお良い。

- 閲覧者側
  - SNS上で返信するくらいの気軽さでコメントをして欲しい。
  - ある程度の匿名性がありながら、アイデンティティが存在しても良い。

これに名前があるのか知らないが、想像しているのはインタラクティブなステージ的コミュニケーション。
ステージは発言者と聴講者に分かれ発言者のみが発言する環境だが、インタラクティブなステージとは聴講者がコメントし、それに対して発言者が回答することも出来る環境。
発言者は聴講者のことを認知していてもしていなくても問題無い。

これ、Nostrを用いればまるっと解決するのでは？と思ったわけである。

## 実験

現状は、nostrの製作者である[fiatjaf](https://github.com/fiatjaf)氏が公開している[nocomment](https://github.com/fiatjaf/nocomment)というスクリプトを埋め込み、CSSを一部カスタマイズしているだけ。

リレーサーバは皆が使っているであろう `wss://relay.damus.io` と、自前の `wss://nostr.h3y6e.com` のみを使用している。沢山のリレーサーバに載せても迷惑だと思うので。

{{ embed https://github.com/fiatjaf/nocomment nocomment }}

その場で鍵ペアを生成して匿名でコメントすることも出来るが、[NIP-07](https://scrapbox.io/nostr/NIP-07)に対応しているため、[nos2x](https://github.com/fiatjaf/nos2x)や[Alby](https://getalby.com/)といったブラウザ拡張機能を用いることで自分の持っているアカウントで投稿出来る。

~~~
<script src="https://nocomment.netlify.app/embed.js" id="nocomment" data-relays='["wss://relay.damus.io", "wss://nostr.h3y6e.com"]'></script>
~~~

## 課題

これはOS/ブラウザ側の問題なのでどうしようも無いが、ChromeやFirefoxのブラウザ拡張機能はモバイル端末では利用出来ないことが多く、故にNIP-07は利用出来ない。

一応、本ブログはIndieWebの[Webmention](https://indieweb.org/Webmention)と[pingback](https://indieweb.org/pingback)に対応しており、[Bridgy](https://brid.gy/)を用いることでTwitterやMastodonの投稿は拾えるようにはなっている（埋め込み等はまだしていないがRSSで購読している）。
しかし、ご存知のようにTwitterのStandard Search APIは取得漏れが多いし、Mastodonはglobal searchを提供していないため、完全ではない。

となると、現状はその場で生成されたアカウント（$\approx$捨て垢）によるコメントを許可する必要があるが、スパムが横行したり治安が大きく悪化したりすることは避けられない。
ただ、これはリレーサーバを適切に選ぶことで解決する課題かもしれないし、専用の有償リレーサーバを用意しても面白いかもしれない。

言語化出来ていない・仕様が固まっていない部分が多いが、理想としては[blogとmicrobloggingの中間?](#blogとmicrobloggingの中間)で述べた通り。
Nostrを用いることで何か良い方法を見つけられそうな気がしている。
