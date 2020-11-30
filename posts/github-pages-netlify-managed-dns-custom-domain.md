@def title = "GitHub Pages + Netlify DNS でカスタムドメイン"
@def date = Date(2019, 06, 09)
@def tags = ["netlify", "domain", "githubpages"]
@def rss =  "GitHub Pagesにもカスタムドメインを設定する"

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

GitHub Pagesのレポジトリのページから Setting > Options > GitHub Pages > Custom domain にカスタムドメインを書いてSave

完成
