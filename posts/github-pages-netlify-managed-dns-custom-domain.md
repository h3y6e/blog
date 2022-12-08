+++
title = "GitHub Pages + Netlify DNSでカスタムドメイン"
date = Date(2019, 06, 09)
tags = ["netlify", "domain", "githubpages"]
rss_description =  "GitHub Pagesにもカスタムドメインを設定する。"
+++

[これ](/posts/netlify-custom-domain)の続き。

前回、カスタムネームサーバーを使用してDNSをNetlifyに移したのでGoogle DomainsのDNSからはカスタムリソースレコードの設定は出来ない。

NetlifyのDomainsタブを開く。

![netlify_domains_tab](/img/2019-06-09/netlify_domains_tab.png)

DNS settingsのAdd new recordを以下のように設定する。

```
Record type: ALIAS
Name: @
Value: *USERNAME*.github.io
```

![netlify_dns_settings](/img/2019-06-09/netlify_dns_settings.png)

GitHub PagesのレポジトリのページからSetting > Options > GitHub Pages > Custom domainにカスタムドメインを書いてSave。

完成。
