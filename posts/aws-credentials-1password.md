+++
title = "1PasswordでAWSクレデンシャルを扱うならop pluginより素のopコマンド"
date = Date(2025, 5, 30)
tags = ["aws", "1password"]
rss_description = "1Passwordでcredential_processを使う際は、op pluginを経由せず素のopコマンドを使う方が柔軟で便利"
+++

## はじめに

1PasswordでAWSクレデンシャルを管理する際は[公式のop plugin](https://developer.1password.com/docs/cli/shell-plugins/aws/)の利用が一般的だが、`credential_process` を使う場合は素の `op` コマンドを直接使うことで、より高い柔軟性を得られる。

## op pluginを使わない理由

op pluginは独自の認証メカニズムを使用しており、AWS CLIの標準的な `credential_process` との併用が難しい。特にgit-remote-s3など `credential_process` を必要とするツールとの組み合わせで使いにくい。

{{ embed https://github.com/1Password/shell-plugins/issues/213 }}

この問題は、素の `op` コマンドを直接 `credential_process` で呼び出すことで回避できる。

## 設定方法


`~/.aws/config` に以下を記述する

```toml
[default]
credential_process=sh -c "op --account=my.1password.com --vault='env' item get --format=json --fields=label=AccessKeyId,label=SecretAccessKey aws-dev | jq 'map({key: .label, value: .value}) | from_entries + {Version: 1}'"
```

対応するaccount/vaultにitemを追加する

![1password item](/img/2025-05-30/1password-env-aws-dev.png)

### 設定の詳細

コマンドの構成:

1. `op --account=my.1password.com --vault='env' item get --format=json --fields=label=AccessKeyId,label=SecretAccessKey aws-dev`
   - 1Passwordの `env` vaultから `aws-dev` というアイテムを取得
   - `AccessKeyId` と `SecretAccessKey` のフィールドだけを抽出
   - JSON形式で出力

2. `jq 'map({key: .label, value: .value}) | from_entries + {Version: 1}'`
   - 1Passwordの出力形式をAWS CLIが期待する形式に変換
   - `Version: 1` を追加（`credential_process` の仕様で必須）

## 利点

### AWS CLIの全機能と互換性がある

`credential_process` はAWS CLIの標準機能のため、`aws sso` などすべてのAWSツールで問題なく動作する。

### 柔軟な設定が可能

プロファイルごとに異なる1Passwordアイテムを参照できる。

```toml
[default]
credential_process=sh -c "op item get aws-prod --format=json --fields=label=AccessKeyId,label=SecretAccessKey | jq 'map({key: .label, value: .value}) | from_entries + {Version: 1}'"

[profile dev]
credential_process=sh -c "op item get aws-dev --format=json --fields=label=AccessKeyId,label=SecretAccessKey | jq 'map({key: .label, value: .value}) | from_entries + {Version: 1}'"
```

### 他のツールとの統合が簡単

Terraformや各種SDKなど、AWS CLIの設定を読み込むツールとも連携できる。

### Touch IDが利用できる

[aws-vault](https://github.com/99designs/aws-vault)はmacOSでTouch IDがサポートされておらず([#273](https://github.com/99designs/aws-vault/issues/273))、Keychainアクセスのたびにパスワード入力が必要。

`op` コマンドはTouch IDに対応しているため、指紋認証だけでアクセスできる。

## まとめ

`credential_process` を使う場合は、op pluginより素の `op` コマンドを直接使う方が柔軟性と互換性に優れる。
特に複数のAWSアカウントを使い分ける場合や、AWS CLIの全機能を使用する必要がある場合に適している。
