+++
title = "[論文読み] Shape from Shading through Shape Evolution"
date = Date(2019,08,29)
tags = ["paper", "cv"]
rss_description = "論文読み : 形状進化による3Dデータを用いたShape-from-Shading"
+++

* Shape from Shading through Shape Evolution
* Dawei Yang, Jia Deng
* CVPR, 2018
* [arXiv](https://arxiv.org/pdf/1712.02961.pdf), [SemanticScholar](https://www.semanticscholar.org/paper/Shape-from-Shading-Through-Shape-Evolution-Yang-Deng/d74a576cc311841c3ff8070262e928c090e41f59)

## What it is about
実画像の Shape-from-Shading を DNN に学習させる際のデータとして、単純なプリミティブ（珠、立方体、等）を用いて作成された 3D データを用いる手法を提案。

## Why it is worthy researching

既存手法では全て人手で作成されたデータを用いていた。

提案手法ではシンプルなプリミティブを組み合わせて複雑な形状のデータセットを適宜作成して、 DNN の学習をすることでデータ不足を解決する。
トレーニングに外部データセットを用いることなく、実画像に対する Shape-from-Shading において State-of-the-Art（SoTA）を達成。

## Key idea

#### Shape Representation
初期形状は球、円柱、立方体、円錐の 4 つの形状で構成されており、それらは以下の函数で表すことが出来る。  
![Screenshot from 2019-08-30 06-38-36](https://user-images.githubusercontent.com/38322494/63978227-da9a0700-caf0-11e9-91b4-7af7e8d0c61d.png)  
Computation graph で表現すると以下のようになる。  
![Screenshot from 2019-08-30 00-57-03](https://user-images.githubusercontent.com/38322494/63973257-5db56000-cae5-11e9-839a-020fa8a9a7b4.png)

形状変換（平行移動、回転、拡大縮小）  
![Screenshot from 2019-08-30 00-57-16](https://user-images.githubusercontent.com/38322494/63973265-60b05080-cae5-11e9-941b-1d9bf10b0e90.png)

形状結合  
![Screenshot from 2019-08-30 00-57-23](https://user-images.githubusercontent.com/38322494/63973273-627a1400-cae5-11e9-9bad-53d556c466d9.png)

#### 進化アルゴリズム
形状変換と形状結合を繰り返すことでより複雑な形状へ進化させる。  
Computation graph が大きくなりすぎないように（制約がなければ平均計算コストは指数関数的に増加する）、計算回数が線形になるようにグラフの成長を制限する。また、形状結合前後で変化がほぼ無いケースを検出し排除する等、進化が遅くならないようにする。

バリデーションを実画像で行うため、実画像が持つ形状とかけ離れた形状を持つトレーニングデータは捨てられる。  
![Screenshot from 2019-08-30 07-30-14](https://user-images.githubusercontent.com/38322494/63980943-0ff62300-caf8-11e9-8830-8dd2a6c71bf9.png)


shape-from-shading ネットワークは [Stacked Hourglass Network](https://arxiv.org/pdf/1603.06937.pdf) を使用している。  
![Screenshot from 2019-08-30 07-20-29](https://user-images.githubusercontent.com/38322494/63980458-af1a1b00-caf6-11e9-9f67-906a8270f5e7.png)

## How it is validated （experimental setup and results）

[MIT-Berkeley Intrinsic Image](http://www.cs.toronto.edu/~rgrosse/intrinsic/gallery.html) データセットを用いて
SIRFS ([Shape, Illumination, and Reflectance from Shading](https://www2.eecs.berkeley.edu/Pubs/TechRpts/2013/EECS-2013-117.pdf)) と比較。
提案手法は形状のみを進化させテクスチャは進化させないので、テクスチャレス画像を使用した SIRFS と比較する。
![Screenshot from 2019-08-30 00-57-52](https://user-images.githubusercontent.com/38322494/63975239-863f5900-cae9-11e9-82e3-98c87b0b5e88.png)

他の手法（ランダム、 SIRFS, [ShapeNet](https://arxiv.org/pdf/1512.03012.pdf)）との比較。
![Screenshot from 2019-08-30 07-33-59](https://user-images.githubusercontent.com/38322494/63981084-a1fe2b80-caf8-11e9-8193-f9febb407a71.png)

## Limitations
結局、トレーニングでも表面法線の ground truth を含むデータセットは必要？

## What you thought
プリミティブから 3D データを構築するごとに DNN が fine-tuning されていくため、最適な結果を見つけるためにはいくつかの重みで検証する必要がある。

## Papers to read before and after the work

[Stacked Hourglass Networks for Human Pose Estimation](https://arxiv.org/pdf/1603.06937.pdf)

[Realistic Adversarial Examples in 3D Meshes](https://www.semanticscholar.org/paper/Realistic-Adversarial-Examples-in-3D-Meshes-Yang-Xiao/047670f1b38e8df8f5cb6d623e939eecbc2d2315)  

[MeshAdv: Adversarial Meshes for Visual Recognition](https://www.semanticscholar.org/paper/MeshAdv%3A-Adversarial-Meshes-for-Visual-Recognition-Xiao-Yang/1a83564d61aebde360c0be4834cf6eb4c472c1bd)  

[Learning to Generate 3 D Training Data through Hybrid Gradient](https://www.semanticscholar.org/paper/Learning-to-Generate-3-D-Training-Data-through-Yang/d8bf8a6bcee94ac70a95934cafa858051d74c05e)
