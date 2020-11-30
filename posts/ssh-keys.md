@def title = "ssh keys"
@def date = Date(2019,10,08)
@def tags = ["ssh"]
@def rss = "何回やっても覚えられないので自分用に"

## クライアント側

`~/.ssh/` で

```shell
ssh-keygen -t rsa -b 4096 -N [pass] -f [file_name] -C [comment(file_nameなど)]
```
## サーバー側
`authorized_keys` に `[file_name].pub` をコピペ
