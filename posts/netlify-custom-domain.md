@def title = "Netlify でさくっとカスタムドメイン"
@def date = Date(2019,06,09)
@def tags = ["netlify", "domain"]
@def rss =  "院試勉強の疲れからか気がついたらドメイン買ってnetlifyに設定してしまったので殴り書く"

## カスタムドメインの購入

[Google Domains](https://domains.google.com)で流行りの.devドメインを購入\
日本語対応してるので簡単

> Google Domains のサービスは、現在お住まいの国で営利目的または商用で使用する場合にのみご利用いただけます。

って書かれてたんだけど、皆んな個人利用で使ってるし、そもそも`.dev`って開発者向けのドメインだから別にいいよね（？）

ちなみに [Kyash](https://kyash.co/)で買えた　嬉しい

## Netlifyにカスタムドメインを設定

![netlify_domain_management](/img/2019-06-09/netlify_domains.png)

このページで設定する  

Add custom domain からお好きなカスタムドメインを追加

画像のように`blog`等のサブドメインも可能  

Check DNS configration という警告が出るのでそれをクリックして出てきたメッセージに従う

(ググってよく出てくるのはカスタムリソースレコードのCNAMEの設定だが、そんなことをしなくてもカスタムネームサーバーを使用すればNetlifyのManaged DNSが勝手に設定してくれる)

Netlifyに提示されたネームサーバーをGoogle DomainsのDNS > ネームサーバー に追加する  

## HTTPS化

![netlify_https](/img/2019-06-09/netlify_https.png)

自動的に設定される  

Verify DNS configurationを押したらすぐ有効化された

さくっとできた
