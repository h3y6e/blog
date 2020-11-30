@def title = "Ubuntu で解像度の異なる複数のディスプレイを同時にいい感じに使いたい"
@def date = Date(2019,05,20)
@def tags = ["ubuntu", "display"]
description: "研究室で与えられたディスプレイの解像度が異なっていて気持ち悪かったので修正した(?)ときのメモ。"

解像度とサイズの違う２つのディスプレイをどうにかしていい感じに使いたい

## 環境
OS: Ubuntu 18.04 LTS  
display:  
 - Dell 24inch FullHD 1920x1200 (16:10)  
 - BenQ 27inch WQHD 2560x1440 (16:9)  

## XRandR
「エックス・アール・アンド・アール」と読むらしい。
X Window Systemを再起動せずに解像度の変更・画面の回転・表示モニタの切り替え・マルチモニタの設定を行うライブラリとコマンド。
```shell
> xrandr
```
でディスプレイの情報を得られる。
```shell
Screen 0: minimum 8 x 8, current 4480 x 1440, maximum 32767 x 32767
DVI-D-0 connected 1920x1200+0+0 (normal left inverted right x axis y axis) 518mm x 324mm
   1920x1200     59.95*+
   1920x1080     60.00  
   1680x1050     59.95  
   1600x1200     60.00  
   1280x1024     60.02  
   1280x960      60.00  
   1024x768      60.00  
   800x600       60.32  
   640x480       59.94  
HDMI-0 disconnected (normal left inverted right x axis y axis)
DP-0 connected primary 2560x1440+1920+0 (normal left inverted right x axis y axis) 597mm x 336mm
   2560x1440     59.95*+
   1920x1080     60.00    59.94    50.00  
   1680x1050     59.95  
   1600x900      60.00  
   1280x1024     75.02    60.02  
   1280x800      59.81  
   1280x720      60.00    59.94    50.00  
   1024x768      75.03    60.00  
   800x600       75.00    60.32  
   720x576       50.00  
   720x480       59.94  
   640x480       75.00    59.94    59.93  
DP-1 disconnected (normal left inverted right x axis y axis)
DP-2 disconnected (normal left inverted right x axis y axis)
DP-3 disconnected (normal left inverted right x axis y axis)
DP-4 disconnected (normal left inverted right x axis y axis)
DP-5 disconnected (normal left inverted right x axis y axis)
```
こんな。  
見方としては、  
 - `DVI-D-0`や`DP-0`は接続端子
 - `connected`/`disconnected`はその端子の接続有無
 - `primary`/` `はプライマリかどうか
 - `1920x1200+0+0`や`2560x1400+1920+0`は解像度+x方向の位置+y方向の位置
 - `518mm x 324mm`や`597mm x 336mm`は実際のディスプレイサイズ


## 方針
 - 実際のサイズ
![実際のサイズ](/img/2019-05-20/actual.png)

 - 解像度
![解像度](/img/2019-05-20/resolution.png)

方法としては２つある。
1. WQHDのディスプレイのスケールを小さくする。
2. FullHDのディスプレイのスケールを大きくする。

$$
\frac{1200}{1440} \times \frac{336\,\rm{mm}}{324\,\rm{mm}} = 0.864...
$$

$$
\frac{1440}{1200} \times \frac{324\,\rm{mm}}{336\,\rm{mm}} = 1.157...
$$

WQHDディスプレイの解像度を約0.864倍、またはFullHDディスプレイの解像度を約1.157倍すれば良いことが分かる。

## シェルコマンド
 - WQHDのディスプレイのスケールを小さくし、全体の文字サイズを小さくする
```shell
xrandr --output DVI-D-0 --scale 1x1 --panning 1920x1200+0+0 --output DP-0 --scale 0.864x0.864 --pos 1920x0
gsettings set org.gnome.desktop.interface text-scaling-factor 0.864
```
WQHDのディスプレイのスケールを小さくすると、そのディスプレイでは表示が拡大され、文字が非常に大きくなる。  
それを修正するために、Universal Access機能を有効にしている。(二行目のコマンド)  

 - FullHDのディスプレイのスケールを大きくし、全体の文字サイズを大きくする
```shell
xrandr --output DVI-D-0 --scale 1.157x1.157 --pos 0x0 --output DP-0 --scale 1x1 --panning 2560x1440+2221+0
gsettings set org.gnome.desktop.interface text-scaling-factor 1.157
```
FullHDのディスプレイのスケールを小さくすると、そのディスプレイでは表示が縮小され、文字が非常に小さくなる。
それを修正するために、Universal Access機能を有効にしている。

２つとも試してみて後者を採用することにした。  
無理に解像度を変更しているのでどちらにせよ滲んでしまうのだが、WQHDのディスプレイをメインで使うつもりなのでFullHDの方を犠牲にした。
(シャープに表示することもできるかもしれないが見つけられなかった)

## 結論
マウスポインタの移動やウィンドウの移動で気持ち悪い思いをしなくて良くなったが、滲みが気になってしまって仕方がない。  
慣れなのかもしれないがこれになれるくらいならマウスポインタ移動時の気持ち悪さになれるほうが良い気がしてくる。  
