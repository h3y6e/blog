---
title: "GitHub Pages + Netlify DNSでカスタムドメイン"
date: 2019-06-09
type: "Guide"
aliases: ["/posts/github-pages-netlify-managed-dns-custom-domain/"]
tags: ["hosting"]
rss_description:  "GitHub Pagesにもカスタムドメインを設定する。"
---

[これ](/posts/2019/06/09/netlify-custom-domain/)の続き。

前回、カスタムネームサーバーを使用してDNSをNetlifyに移したのでGoogle DomainsのDNSからはカスタムリソースレコードの設定はできない。

NetlifyのDomainsタブを開く。

![netlify_domains_tab](netlify_domains_tab.png)

DNS settingsのAdd new recordを以下のように設定する。

```
Record type: ALIAS
Name: @
Value: *USERNAME*.github.io
```

![netlify_dns_settings](netlify_dns_settings.png)

GitHub PagesのレポジトリのページからSetting > Options > GitHub Pages > Custom domainにカスタムドメインを書いてSave。

完成。
