@def title = "Windows 10 のための Terminal"
@def date = Date(2019,05,19)
@def tags = ["windows", "terminal", "shell"]
@def rss = "WindowsのTerminal探し。「日本語入力対応、タブ機能あり、高速、お洒落」"

自分が使ってきたTerminalを順にまとめていく。

## 1. Windows標準コンソール
論外。


## 2. Alacritty
https://github.com/jwilm/alacritty

#### pros
 - GPU-acceleratedで非常に高速

#### cons
 - 日本語入力に難あり(入力窓が別のところに出てくるアレ)
 - タブ機能なし
 - 最低限のデザイン


## 3. Fluent Terminal
https://github.com/felixse/FluentTerminal

#### pros
 - WindowsのFluent Desginに合っていて良い
 - タブ機能あり

#### cons
 - 入力切り替えできない


## 4. Terminus
https://github.com/Eugeny/terminus

#### pros
 - タブ機能あり
 - 日本語対応
 - リガチャ対応
 - デザイン良い

#### cons
 - 起動が遅い
 - 動作遅い、vimのカーソル移動がカクつく
 - タブを移動すると文字が見えなくなる（再度入力すると見えるようにはなる）


## 5. Hyper
https://github.com/zeit/hyper

#### pros
 - デザインよい
 - プラグインでカスタマイズできる

#### cons
 - electron製なのでそれなりに遅い
