+++
title = "GitHub Pages + Netlify DNSでカスタムドメイン"
date = Date(2019, 06, 09)
tags = ["netlify", "domain", "githubpages"]
rss =  "GitHub Pagesにもカスタムドメインを設定する。"
+++

[これ](/netlify-custom-domain)の続き。

前回、カスタムネームサーバーを使用して DNS を Netlify に移したので Google Domains の DNS からはカスタムリソースレコードの設定は出来ない。

Netlify の Domains タブを開く。

![netlify_domains_tab](/img/2019-06-09/netlify_domains_tab.png)

DNS settings の Add new record を以下のように設定する。

```
Record type: ALIAS
Name: @
Value: *USERNAME*.github.io
```

![netlify_dns_settings](/img/2019-06-09/netlify_dns_settings.png)

GitHub Pages のレポジトリのページから Setting > Options > GitHub Pages > Custom domain にカスタムドメインを書いて Save。

完成。
