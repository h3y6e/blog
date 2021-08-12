+++
title = "ssh keys"
date = Date(2019,10,08)
tags = ["ssh"]
rss_description = "何回やっても覚えられないので自分用に。"
+++

## クライアント側

`~/.ssh/` で以下を実行。

```shell
ssh-keygen -t rsa -b 4096 -N [pass] -f [file_name] -C [comment(file_nameなど)]
```
## サーバー側
`authorized_keys` に `[file_name].pub` をコピペ。
