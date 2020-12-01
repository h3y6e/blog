@def title = "[論文読み] How Do Humans Sketch Objects? "
@def date = Date(2019,10,24)
@def tags = ["paper", "cv"]
@def rss = "人間はどのように物体をスケッチするか"

* How Do Humans Sketch Objects? 
* Mathias Eitz, James Hays, Marc Alexa
* SIGGRAPH, 2012
* [PDF](http://cybertron.cg.tu-berlin.de/eitz/pdf/2012_siggraph_classifysketch.pdf)
* [Website](http://cybertron.cg.tu-berlin.de/eitz/projects/classifysketch/)
* video  
[![](https://img.youtube.com/vi/zMzprmtJ6Ck/0.jpg)](https://www.youtube.com/watch?v=zMzprmtJ6Ck)

## What it is about
人間のスケッチのクラシフィケーション \\
※ スケッチ = 熟練者が描いたものではない抽象的な絵(ピクトグラフ)

## Why it is worthy researching

 - 人間が物体をどのようにスケッチし、そのようなスケッチを人間とコンピューターがどれだけうまく認識できるかについての正式な研究はこれまでなかった．人間のスケッチに対する最初の大規模な調査．  
 - Amazon Mechanical Turk というクラウドソーシングサービスを利用してデータセットを生成している．
 - 人間の認識精度も Amazon Mechanical Turk を用いて得ている．
 - 学習モデルとしてkNN法，SVMを使用

## Key idea
データセット
![fig2](https://user-images.githubusercontent.com/38322494/67061239-b1b1fc00-f19a-11e9-8c71-0e01dcb36a78.png)
 - 250のカテゴリ:  
 日常生活で見かける，形状だけで認識可能なオブジェクトを網羅している  

 - 20,000個のスケッチ:  
 スケッチされたストロークの空間的パラメータと時間的順序を保存する  
 (ただし，この研究では時間的順序は使用されていない)  
 1カテゴリ毎に80個，合計20,000個のスケッチ


## How it is validated (experimental setup and results)
![fig10](https://user-images.githubusercontent.com/38322494/67063550-22a8e200-f1a2-11e9-8161-1bc80112fc35.png)
56％の精度で未知のスケッチを識別することができている

![fig11](https://user-images.githubusercontent.com/38322494/67061287-d3ab7e80-f19a-11e9-9b80-f15c48fd6528.png)
人間と計算機の認識精度の違いを示すマトリックス  
赤: 人間の方が良い精度, 青: 計算機の方が良い精度  
0は省略している

![fig12](https://user-images.githubusercontent.com/38322494/67061303-db6b2300-f19a-11e9-910c-78fec2eeb13a.png)


## Limitation
人間は73.1%なので人間のほうが圧倒的に精度は高い

## What you thought
2012年の論文なので人間のほうが認識精度が高いという結果になっているが，現在はどのくらい精度が上がっているのか，他の論文を読んでみたい

