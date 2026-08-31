---
title: "RaycastでPLaMo翻訳を使う"
date: 2025-06-21
tags: ["raycast"]
rss_description: "Script Command機能を使ってPLaMo翻訳CLIをRaycastから呼び出せるようにした"
---

## tl;dr

[Raycast Script Command](https://github.com/raycast/script-commands)機能を使って、日本語/英語の翻訳を即時実行できるようにした。
PLaMo翻訳モデルをローカルで動かすことで、ネットワーク接続不要で比較的高速な翻訳が可能。

## 経緯

これまで[Raycast](https://www.raycast.com/)の[AI機能](https://manual.raycast.com/ai)を使い、[Ollama](https://ollama.com/)をバックエンドにして[qwen3:4b](https://ollama.com/library/qwen3)で日英翻訳していた。

{{ embed https://mixi.social/@h3y6e/posts/c1d57e76-b435-4d70-a57d-ab8f5dfd90f8 }}

ローカルでこの精度の翻訳ができることには感動ものなのだが、やはりプロプライエタリLLMと比較すると遅いし長文になると精度に難があるので少し不満があった。

そこで、Preferred Networksが公開している[plamo-translate-cli](https://github.com/pfnet/plamo-translate-cli)をRaycastの[Script Command](https://www.raycast.com/blog/getting-started-with-script-commands)から呼び出せるようにしようと考えた。

## Raycast Script Commandとは

RaycastのScript Command機能は、任意のスクリプトをRaycastから実行できる機能である。shell script以外にも対応している。
メタデータをスクリプトのコメントとして埋め込み、フォルダを登録しておくことでRaycastが認識してくれる。

{{ embed https://github.com/raycast/script-commands }}

主要なパラメータ: 
- `@raycast.title`: Raycastで表示されるコマンド名
- `@raycast.mode`: 出力モード（fullOutput, compact, silent, inline）
- `@raycast.argument1`: コマンドの引数定義

## 実装

### スクリプト全体

やっていることは単純で、引数として渡されたテキストを入力として `plamo-translate` コマンドを実行するだけ。

```bash
#!/usr/bin/env bash

set -Eeufo pipefail

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Translate ja <-> en with PLaMo
# @raycast.mode fullOutput

# Optional parameters:
# @raycast.icon 🌐
# @raycast.argument1 { "type": "text", "placeholder": "text (ja/en)" }

# Documentation:
# @raycast.author h3y6e
# @raycast.authorURL https://raycast.com/h3y6e

export PATH="$HOME/.local/share/mise/shims:$PATH"

if ! command -v plamo-translate >/dev/null 2>&1; then
  echo >&2 "Error: plamo-translate not found"
  exit 1
fi

plamo-translate --input "$1"
```

dotfilesで公開している

{{ embed https://github.com/h3y6e/dotfiles/blob/main/dot_config/raycast-script/executable_plamo-translate.sh }}

### ポイント

#### fullOutputモード

```bash
# @raycast.mode fullOutput
```

翻訳結果は複数行になることがあるため、`fullOutput` モードを使用している。これにより、翻訳結果全体が表示される。

#### mise経由でのコマンド実行

```bash
export PATH="$HOME/.local/share/mise/shims:$PATH"
```

自分は[mise](https://mise.jdx.dev/)を使って[各種runtimeを管理](https://github.com/h3y6e/dotfiles/blob/main/dot_config/mise/config.toml)している。
Raycastから実行される際は[PATHが通っていない](https://github.com/raycast/script-commands#troubleshooting-and-faqs)ため、明示的にmiseのshimsディレクトリをPATHに追加している。

## セットアップ

#### Raycast Script Commandの設定
  1. スクリプトを `~/.config/raycast-script/` ディレクトリ（任意）に配置
  2. 実行権限を付与: `chmod +x plamo-translate.sh`
  3. Raycastで `Extensions → Script Commands → Add Directories` を選択し、上記ディレクトリを追加

#### plamo-translate-cliのインストール
mise設定ファイル（`~/.config/mise/config.toml`）に以下を追加: 
```toml
"pipx:pfnet/plamo-translate-cli" = { version = "latest", uvx_args = "-p 3.12" }
```
そして `mise install` を実行

## おわり

Raycast Script CommandとPLaMo翻訳CLIの組み合わせで、開発中の翻訳作業が格段に楽になった。
同様の仕組みで他のCLIツールもRaycastから呼び出せるようにできるので、色々試してみたい。
