+++
title = "Karabinerでfnキーに3つの機能を持たせた"
date = Date(2023, 4, 30)
tags = ["karabiner", "macos"]
rss_description = "fnキーを単体押し・組み合わせ・長押しで異なる動作をさせる設定を作った"
+++

## 経緯

キーボードのfnキーがもったいないと感じていた。ほとんど使っていなかったので、もっと活用できないかと考えた。

Karabiner-Elementsを使えば、単一のキーに複数の機能を持たせることができる。今回はfnキーに3つの動作を割り当てることにした。

## 実装

作成した設定は以下の通り。

```json
{
  "description": "fn単体 → Mission Control、組み合わせ → Prox key (Alt+Ctrl+⌘)、長押し → fn",
  "manipulators": [
    {
      "from": {
        "key_code": "fn",
        "modifiers": { "optional": ["left_shift"] }
      },
      "to": [
        {
          "key_code": "left_command",
          "modifiers": ["left_control", "left_option"]
        }
      ],
      "to_if_alone": [{ "key_code": "mission_control" }],
      "to_if_held_down": [
        {
          "halt": true,
          "key_code": "fn"
        }
      ],
      "type": "basic"
    }
  ]
},
```

この設定により、fnキーは以下のように動作する。

1. 単体で押した場合: Mission Controlが起動
2. 他のキーと組み合わせた場合: `Alt+Ctrl+⌘`（ProxKey）として動作
3. 長押しの場合: 通常のfnキーになる

## 使い道

### Mission Control

fnキーを軽くタップするだけでMission Controlが起動できる。開いているウィンドウを一覧表示できるので、アプリケーション間の切り替えが楽になった。

### ProxKey

`Alt+Ctrl+⌘` の組み合わせは「ProxKey」と呼ぶことにした。Hyper key（`Ctrl+Shift+Alt+⌘`）やMeh key（`Ctrl+Shift+Alt`）とは異なる組み合わせで、特定のアプリケーションでの使用を想定している。名前は「Proximity」（近接性）から。

ProxKeyは他のアプリケーションとキーバインドが競合しにくいため、主にRaycastのショートカットに利用している。

- ウィンドウスナップ（画面の左半分、右半分への配置など）
- クリップボード履歴の呼び出し
- その他Raycast経由の各種機能

Raycastのホットキー設定でProxKeyとの組み合わせを割り当てることで、統一的なショートカット体系を構築できた。

### fn

長押しすれば通常のfnキーとして動作するので、`fn+Delete`（前方削除）や `fn+矢印キー`（Home/End）もそのまま使える。

## まとめ

Karabinerの `to_if_alone` と `to_if_held_down` を使うことで、1つのキーに3つの役割を持たせることができた。

{{ embed https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/to-if-alone/ }}
