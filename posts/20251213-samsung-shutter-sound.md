+++
title = "Samsung Galaxyのカメラシャッター音を消す"
date = Date(2025, 12, 13)
tags = ["android"]
rss_description = "adb shell settings put system csc_pref_camera_forced_shuttersound_key 0"
+++

## 方法

Samsung Galaxy Z Fold7; One UI 8.0; Android 16

カメラシャッター音は以下のコマンドで無効化できる

```bash
adb shell settings put system csc_pref_camera_forced_shuttersound_key 0
```

## 手順

1. 開発者向けオプションを有効化（設定 → 端末情報 → ソフトウェア情報 →「ビルド番号」を複数回タップ）
2. USBデバッグを有効化（設定 → 開発者向けオプション →「USBデバッグ」をオン）
3. PCとUSB接続してデバッグを許可
4. 上記コマンドを実行

システムアップデート後は設定がリセットされるため、再実行が必要
