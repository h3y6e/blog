+++
title = "Netlifyでさくっとカスタムドメイン"
date = Date(2019,06,09)
tags = ["netlify", "domain"]
rss_description =  "院試勉強の疲れからか気がついたらドメイン買ってnetlifyに設定してしまったので殴り書く。"
+++

## カスタムドメインの購入

[Google Domains](https://domains.google.com)で流行りの `.dev` ドメインを購入。
日本語対応してるので簡単。

> Google Domains のサービスは、現在お住まいの国で営利目的または商用で使用する場合にのみご利用いただけます。

って書かれてたんだけど、皆んな個人利用で使ってるし、そもそも `.dev` って開発者向けのドメインだから別にいいよね（？）

ちなみに [Kyash](https://kyash.co/)で買えた。嬉しい。

## Netlify にカスタムドメインを設定

![netlify_domain_management](/img/2019-06-09/netlify_domains.png)

このページで設定する。

Add custom domain からお好きなカスタムドメインを追加。

画像のように `blog` 等のサブドメインも可能。

Check DNS configration という警告が出るのでそれをクリックして出てきたメッセージに従う。

（ググってよく出てくるのはカスタムリソースレコードの CNAME の設定だが、そんなことをしなくてもカスタムネームサーバーを使用すれば Netlify の Managed DNS が勝手に設定してくれる）

Netlify に提示されたネームサーバーを Google Domains の DNS > ネームサーバー に追加する。

## HTTPS 化

![netlify_https](/img/2019-06-09/netlify_https.png)

自動的に設定される。

Verify DNS configuration を押したらすぐ有効化された。

さくっとできた。
