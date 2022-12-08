+++
title = "Podcastことはじめ"
date = Date(2022, 12, 09)
tags = ["camphor", "adventcalendar", "podcast"]
rss_description = "CAMPHOR-でPodcastを始めたので収録から配信までの知見を書く。"
cover = "/img/2022-12-09/og.png"
+++

<!-- textlint-disable ja-technical-writing/no-mix-dearu-desumasu -->
この記事は[CAMPHOR- Advent Calendar 2022](https://advent.camph.net)の9日目の記事です。

## はじめに
こんにちは、[へいほぅ](https://twitter.com/h3y6e)です。[CAMPHOR-](https://camph.net/)の運営メンバーです。

CAMPHOR-で『[CAMPHOR- DOWNTIME](https://anchor.fm/camphor-downtime)』という雑談系Podcastを始めました。\\
この記事が公開されているときには第0回しか無いと思いますが、今年中にもう1,2個出せたら良いなと考えています[^次回]。

この回では、CAMPHOR-とは何か、なぜPodcastを始めたのかなどを緩く話しています。
~~~
<div style="max-width: 765px;"><div style="left: 0; width: 100%; height: 102px; position: relative;"><iframe src="https://anchor.fm/camphor-downtime/embed/episodes/0--Podcast-e1rbeco" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="encrypted-media;"></iframe></div></div>
~~~

音声メディア（AM, FM, Podcast）が好きで何年も聴き漁っており、何故か収録や編集も含めて理解しているつもりになっていましたが、やはり作る側になると改めてその難しさや沼の深さに驚かされました。\\
例えば第0回ではマイクの指向性を勘違いしており一方の声が小さくなるという、かなり初歩的なミスを犯しています…。お聴き苦しいかと思いますが、温かい目で（耳で？）聴いていただけると幸いです。

Podcastのセットアップについてまだ見識が浅く手探りな状態ですが、記録として残しておきたいと思います。

[^次回]: この記事の執筆時点で次エピソードの編集は殆ど終わっています。お楽しみに。

## 収録時
#### 収録前に気を付けること
- **マイクは出来るだけ良いもの & 有線接続**のものを使う。
- **未圧縮リニアPCMで収録・保存**するのがベターだが、記憶領域を大量に消費するのでストレージと相談する。macOSのQuickTime Playerでは品質を「最高」に設定するとそれになる。
- **部屋の音の反響を減らす**。布団や衣服などの音を吸収する物で自分を囲むだけでもかなり改善する。

#### 収録中に気を付けること
- 雑音や物音[^雑音や物音] を出さないように気をつける。特に[リップノイズ](https://www.clubjungle.jp/bress/909/)は不快に感じやすい。口内が乾燥しないよう**適度に水分を摂取する**などで対策する。
- **過剰な相槌を抑える**。声を出さずに頷くことを意識し、相槌を打つ場合は相手の言葉に重ならないように注意する。
- 意識することは難しいが、**フィラー[^フィラー] を極力減らす**ように努力する。

[^雑音や物音]: マウスのクリック音、トラックパッドのタッチ音、キーボードのタイプ音、通知音、スマホのバイブ音、机を触った時マイクに伝わる振動音、発声時のリップノイズ、考えるときにスーと息を吸う音、など。
[^フィラー]: 次の言葉を選んでいる間の隙間を埋める「あー」「えっと」「なんか」などの発話。[Wikipedia: Filler](https://en.wikipedia.org/wiki/Filler_(linguistics))

### オンサイト収録
[CAMPHOR- HOUSE](https://camph.net/#house)にはmarantz Professionalの[MPM-1000U](https://amzn.to/3uvM0mv)というUSBコンデンサーマイクがあり、これを使ってPCでローカル録音している。
決して良いマイクとは言えないが、他の単一指向性のコンデンサーマイクと比較して集音範囲が広いという特徴があるので座る位置に気をつければ録音は可能[^理想の収録方法]。

**座布団を敷き詰めるなどして反響音を減らす**となお良い。

[^理想の収録方法]: 出来れば人数分のダイナミックマイクを用意したい。

### リモート収録
2種類の方法がある。
- Double-Ender方式: ビデオ会議ツール等を用いて会話しながら音声をそれぞれのPCでローカル収録し、後から合成する。長く話すとドリフトが起こるので編集時に修正が必要。
- **Podcast収録用のサービスを用いる**。[Zencastr](https://zencastr.com), [Riverside](https://riverside.fm), [Cleanfeed](https://cleanfeed.net), [Podcastle](https://podcastle.ai) など。

## 編集時
[Auphonic](https://auphonic.com/engine/upload/)で**レベラー、ノーマライズ、ノイズ低減、ハム音除去**などが出来る。

Web版とデスクトップ版がある（モバイル版もある）。\\
Web版はサブスクリプション+ワンタイムクレジット制で、無料枠は月2時間。詳細は[こちら](https://auphonic.com/pricing)。

デスクトップ版は買い切りで、個人かつ非商用目的で利用する場合は\$89、それ以外は\$349。7日間のトライアルもある。
[Auphonic Leveler Batch Processor](https://auphonic.com/leveler)と[Auphonic Multitrack Processor](https://auphonic.com/multitrack)の二種類あり、Double-Ender方式で録画した時などトラックが複数ある場合は後者を用いる。
詳細は[こちら](https://auphonic.com/standalone)。

![](/img/2022-12-09/auphonic-1.png)

![](/img/2022-12-09/auphonic-2.png)

[GarageBand](https://www.apple.com/jp/mac/garageband/), [Audacity](https://www.audacityteam.org)などを使い、**不要な間や不快なノイズ、失言などを削除する**。
余りに編集しすぎると不自然になるので程々にする。
無言部分は1秒程度であれば別にそのままにしても良いと思う。
[Logic Pro](https://www.apple.com/jp/logic-pro/)等の有料ソフトウェアを用いると無音部分の自動カットなどが出来る。

編集については[Rebuild](https://rebuild.fm)の宮川さんが執筆された[Podcasting Setup 2020#Post-Production](https://weblog.bulknews.net/podcasting-setup-2020-db90240423d7#:~:text=laptop%20built%2Din%29.-,Post%2DProduction,-First%2C%20I%20run)や[Podcasting Guide 2017#ポストプロダクション編](https://weblog.bulknews.net/podcasting-guide-2017-2e88531a367d#:~:text=%E3%81%8C%E9%87%8D%E8%A6%81%EF%BC%89%E3%80%82-,%E3%83%9D%E3%82%B9%E3%83%88%E3%83%97%E3%83%AD%E3%83%80%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E7%B7%A8,-%E5%8F%8E%E9%8C%B2%E3%81%8C%E7%B5%82)が大変参考になる。

## 公開時
様々な方法があるが、現在CAMPHOR-では[Anchor](https://anchor.fm)というSpotifyが提供するPodcast制作サービスを用いてホスティングや各種プラットフォームへの配信をしている。\\
アカウント作成時の注意点として、モバイル版Anchorから作成した場合のみSocial login（Single Sign-On）を選択出来るが、**一度決定したログイン方法の変更は現状出来ない**。パスワードリセットから通常のパスワード認証に変更は出来ると思う。\\
CAMPHOR-ではSign in with Twitterで登録したものの、何故か最近その選択肢が削除された為、アカウントを作り直すことになった[^パスワード認証]。

新しいエピソードを作成し、編集した音源をアップロードする。
1ファイルあたり250MBまでであることに注意する。

[^パスワード認証]: Eメールとパスワードによる認証にすればいいのでは?と思われるかもしれないが、Anchorは現状ワンタイムパスワード等の二要素認証に対応していない為、二要素認証を設定した別サービスのアカウントでSSOを行いたかった。

### スマートBGMの追加
BGMを追加することでハム音やホワイトノイズを誤魔化すことが出来る。\\
ただし、以下の点から本来なら**付けないことが望ましい**。
 - Podcastは人により再生速度が違う（例えば、筆者は1.2倍や1.25倍で聴くことが多い）
 - BGMが気になって会話に集中出来なくなる可能性がある
 - フリー音源である以上、他のPodcast番組などとBGMが被る


利用する場合、再生速度を上げても違和感のないBGMを選ぶと良い。
そして、**音量を最小にして追加する**ことを推奨する。
左に振り切ってもBGMは充分聴こえる。

例えば、第0回では「フォーク風」内の「**Feathersoft**」を利用している。

![](/img/2022-12-09/smartbgm.png)

### エピソードの説明
各プラットフォームで表示の仕様が異なる。そのため、**リッチテキストエディタではなくHTMLエディタに切り替えて編集する**ことを強く推奨する。

極力どのプラットフォームでもスタイルが崩れないHTMLソースを以下に記す。
```html
<p>〜、〜、〜などについて話しました。<br>
Twitterハッシュタグ #camphor_downtime にて、ご意見ご感想などお待ちしております。</p>
<p><br> 
Show Notes:</p>
<ul>
 <li>ここに話したことを箇条書きで記述する。</li>
 <li>liタグ前に**スペースを1文字**置くことで、タグが機能しない環境の一部(Web版Spotifyなど)で改行を挿入できる。</li>
 <li>一部の環境でaタグが機能しないことを意識してリンクを設置する。<a href="https://camph.net/" target="_blank">camph.net</a></li>
</ul>
<p><br>
Co-Host:</p>
<ul>
 <li>Aさん <a href="https://twitter.com/[Aさんのusername]" target="_blank">twitter.com/[Aさんのusername]</a></li>
 <li>Bさん <a href="https://twitter.com/[Bさんのusername]" target="_blank">twitter.com/[Bさんのusername]</a></li>
</ul>
<p><br>
Editorial Notes:</p>
 <p>必要ならここに編集後記を書く。ここもpタグ前に**スペースを1文字**置くことで、一部の環境で改行できる。</p>
```

以下の点に注意する。
- `Show Notes:`, `Co-Host:`,  `Editorial Notes:` 前のそれぞれの `br` タグはWeb版Amazon Musicで行間を調整する為に記述している。
- 一部の環境（Web版Spotify, Web版Google Podcasts, Web版Apple Podcasts）で `a` タグが機能しないことを意識してリンクを設置する。
- `li` タグ前や `p` タグ前にスペースを**1文字**置いて、タグが機能しない環境の一部（Web版Spotifyなど）で改行を挿入している。**2文字以上では保存にスペースの数が強制的に変更され、インデントが崩れる。**
- `b` タグを設定すると、Web版Google Podcastsでは太字にならず `*` が表示されるので使用する場合は注意する。

~~~
<details><summary><b>例: プラットフォーム毎の表示の違い (クリックして展開)</b></summary>
~~~

第0回のエピソードの説明を例とする。

#### Anchor （web）
- `li` タグによる改行が出来ていないが、`br` タグを用いて無理矢理改行すると他プラットフォームのスタイルが崩れてしまうので諦める
- リンクは有効
- （モバイル版AnchorはPodcaster向けなので考えない）
![](/img/2022-12-09/anchor-web.png)

#### Spotify （web）
- リンク無効
![](/img/2022-12-09/spotify-web-1.png)

機能する環境もある
![](/img/2022-12-09/spotify-web-2.png)

#### Spotify （desktop）
- 改行がクソデカいのは諦める
![](/img/2022-12-09/spotify-desktop.png)

#### Spotify （mobile）
![](/img/2022-12-09/spotify-mobile.jpg)

#### Amazon Music （web）
- `p` タグによる行間開けが出来ないため、`br` タグで調整している
![](/img/2022-12-09/amazon-web.png)

#### Amazon Music （mobile/iOS）
![](/img/2022-12-09/amazon-ios.jpg)

#### Amazon Music （mobile/Android）
![](/img/2022-12-09/amazon-android.png)

#### Google Podcasts （web）
- リンク無効
![](/img/2022-12-09/google-web-1.png)

機能する環境もある
![](/img/2022-12-09/google-web-2.png)

#### Google Podcasts （mobile）
![](/img/2022-12-09/google-mobile.jpeg)

#### Apple Podcasts （web）
- リンク無効
![](/img/2022-12-09/apple-web.png)

#### Apple Podcasts （desktop）
![](/img/2022-12-09/apple-desktop.png)

#### Apple Podcasts （mobile）
![](/img/2022-12-09/apple-mobile.jpg)

 #### Overcast （mobile）
![](/img/2022-12-09/overcast-mobile.jpeg)

#### Pocket Casts （mobile）
![](/img/2022-12-09/pocketcasts-mobile.jpeg)

#### Castbox （web）
![](/img/2022-12-09/castbox-web.png)

#### Castbox （mobile）
![](/img/2022-12-09/castbox-mobile.jpeg)

#### Moon FM （desktop）
- （web版ではエピソード説明を見るUIが無い）
![](/img/2022-12-09/moonfm-desktop.png)

#### Moon FM （mobile）
- 中華フォントになる
![](/img/2022-12-09/moonfm-mobile.jpeg)

#### RadioPublic （web）
![](/img/2022-12-09/radiopublic-web.png)

以上。

~~~
</details>
~~~

また、編集時やShow Notesを書く時などに録音したものを全て聞き直していては時間がかかる[^長時間収録] ので、文字起こしツールとしてOpenAIによる高性能な音声認識モデル[Whisper](https://github.com/openai/whisper)をC/C++に移植した[whisper.cpp](https://github.com/ggerganov/whisper.cpp)を使ってみている。
自分の持っているIntel MacBook Proでも充分動かせるので有り難い。

[^長時間収録]: 因みに第1回は2時間半収録し、大幅にカットした結果1時間半になる予定。

### エピソードのカスタマイズ
基本的には弄る必要は無い?\\
カバーアートは**3000×3000pxのJPEG**でCDN（Amazon CloudFront）に保存されるようなので、アップロード前に[Squoosh](https://squoosh.app)などを用いて圧縮しつつサイズを合わせておくと良い。

### 各種プラットフォーム
CAMPHOR-では2022/12/9時点で以下のプラットフォームで購読出来るようにしている。\\
これらを選んだ基準は明確には無いが、Anchorに紐付けられるプラットフォームで日本語対応しているものが多い。
Moon FMはAnchorと紐付けられるプラットフォームでは無いものの、アプリのデザインが個人的に好きなので対応した。
- [RSS（Anchor)](https://anchor.fm/s/d065c950/podcast/rss)
- [Anchor](https://anchor.fm/camphor-downtime)
- [Spotify](https://open.spotify.com/show/47AmHk2DTtFth5kXto94Ks)
- [Google Podcasts](https://podcasts.google.com/feed/aHR0cHM6Ly9hbmNob3IuZm0vcy9kMDY1Yzk1MC9wb2RjYXN0L3Jzcw)
- [Amazon Music](https://music.amazon.co.jp/podcasts/0b5b05c2-7fb3-465f-a820-639466429f7e)
- [Apple Podcasts](https://podcasts.apple.com/jp/podcast/camphor-downtime/id1656997200)
- [Castbox](https://castbox.fm/channel/CAMPHOR--DOWNTIME-id5228322)
- [RadioPublic](https://radiopublic.com/camphor-downtime-8gnZo1)
- [Overcast](https://overcast.fm/itunes1656997200/camphor-downtime)
- [Pocket Casts](https://pca.st/34t5dagg)
- [Moon FM](https://moon.fm/podcasts/805964)

基本的には音声のみの配信となるが、いい感じに動画を付けてYouTube[^YouTube] に投稿しても良さそう。

[^YouTube]: CAMPHOR-はYouTubeもやってます → [@camphor_kyoto](https://youtube.com/camphor_kyoto)

## 参考にしたいPodcast番組
- 雑談系（個人）: [Rebuild](https://rebuild.fm)
2013年から放送されており、日本におけるテック系Podcastの先駆け。[Podcasting Setup 2020](https://weblog.bulknews.net/podcasting-setup-2020-db90240423d7) に書かれているように音質にかなり気を使われている。
- 雑談・論文紹介系: [いんよう!](https://open.spotify.com/show/2vbZRI8GsdQ7ioWIC215oA)
内容が面白いのは勿論だが、BGMの使い方が上手い。
- 広報系（企業）: [Backyard Hatena](https://open.spotify.com/show/6qnwcLU95nPqqgaUYXzGrK)
企業がオウンドメディアとしてPodcastをやる例は最近増えてきたように感じるが、はてな社は社内Podcastを前から行っていることもあってかその中でもクオリティが高い。

~~~
<blockquote class="twitter-tweet" data-theme="dark"><p lang="ja" dir="ltr">Backyard Hatena、録音環境が良い・無駄なBGM/効果音が無い・ホストがCTOのため技術話が適度に聴ける のでここ数年で最高のオウンドメディアだなと思いながら聴いている</p>&mdash; へいほぅ (@h3y6e) <a href="https://twitter.com/h3y6e/status/1499977577565671425?ref_src=twsrc%5Etfw">March 5, 2022</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
~~~

2020年から、その年聴いていたPodcastで他人に勧めたいものを書いていたので、よければこちらも。
- [ITエンジニア志望の学生が聴くべきPodcast](/posts/podcasts)
- [2021年に聴いていたPodcast](/posts/podcasts2021)

## おわりに
[これ](/posts/podcasts2021)の総括にも書いてありますが、ずっとCAMPHOR-でPodcastをやりたいと思っていたので始められて良かったです。
とはいえ自分はもう卒業するので、CAMPHOR-のPodcastに関しては続けるかどうかも含めて後進に任せることとなります（無責任で申し訳無い）。

個人としては、今回得た知見を元に何らかの形でPodcast配信を続けていきたいと考えています。
