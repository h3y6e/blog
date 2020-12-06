+++
title = "GitHub Pages + Netlify DNSでカスタムドメイン"
date = Date(2019, 06, 09)
tags = ["netlify", "domain", "githubpages"]
rss =  "GitHub Pagesにもカスタムドメインを設定する。"
+++

[これ](/netlify-custom-domain)の続き

前回、カスタムネームサーバーを使用してDNSをNetlifyに移したのでGoogle DomainsのDNSからはカスタムリソースレコードの設定はできない

NetlifyのDomainsタブを開く

![netlify_domains_tab](/img/2019-06-09/netlify_domains_tab.png)

DNS settingsのAdd new recordで

Record type: ALIAS \\
Name: @ \\
Value: *USERNAME*.github.io

として、Saveする

![netlify_dns_settings](/img/2019-06-09/netlify_dns_settings.png)

GitHub PagesのレポジトリのページからSetting > Options > GitHub Pages > Custom domainにカスタムドメインを書いてSave

完成
