+++
title = "[論文読み] Neural Inverse Rendering of an Indoor Scene From a Single Image"
date = Date(2019,05,17)
tags = ["paper", "cv", "inverserendering"]
rss = "論文読み：単一画像からの屋内シーンのニューラルインバースレンダリング"
+++

<!-- textlint-disable ja-technical-writing/max-comma -->

 - Neural Inverse Rendering of an Indoor Scene from a Single Image
 - Soumyadip Sengupta, Jinwei Gu, Kihwan Kim, Guilin Liu, David W. Jacobs, Jan Kautz
 - CVPR, 2019
 - [arXiv](https://arxiv.org/abs/1901.02453v2), [SemanticScholar](https://www.semanticscholar.org/paper/Neural-Inverse-Rendering-of-an-Indoor-Scene-from-a-Sengupta-Gu/f78e5da29363342ebf04d011c4f756ed021a1a11)

<!-- textlint-enable ja-technical-writing/max-comma -->

## What it is about
単一画像からの屋内シーンのニューラルインバースレンダリング。

#### インバースレンダリングとは
画像からシーンの物理的属性を推定することを目的としている。
 - 物体形状（表面法線ベクトル）
 - 反射特性（アルベド）
 - 光源分布（照明マップ）


## Why it is worthy researching

屋内シーンの単一画像を、Inverse Rendering Network（IRN）を用いて以下の 3 つの属性に分解する。  
 - アルベド
 - 表面法線ベクトル
 - 照明の環境マップ

今までの手法では、主に単一のオブジェクトに対して、またはシーン属性の 1 つのみを解決するものだった。  
本稿では、屋内シーンの単一画像に対してそれらのシーン属性を同時に解くことが出来る。
また、SUNCG-PBR という名のデータセットを作成している。
このデータセットは以前のデータセットを大幅に改善したもの。
 * 鏡面反射を仮定したシーン
 * 拡散反射を仮定したシーン
 * ground truth depth
 * surface normals
 * albedo
 * Phong model parameters
 * semantic segmentation
 * glossiness segmentation

以前のデータセットと比べてより写実的でノイズが少ない。

## Key idea
ラベル無しのデータから、self-supervised reconstruction loss という損失関数を使用して学習することが本稿のキーアイデア。  
Self-supervised Learning の Residual Appearance Renderer（RAR）によって可能としている。  

#### Self-supervised Learning
自己教師あり学習。教師なし学習の 1 つ。  
pretext tasks（関係なさそうなタスク）を学習することにより、本当に学習したいタスクで使える特徴表現を学習する。

#### self-supervised reconstruction loss
I:元画像、A:アルベド、L:環境マップ、N:法線。

$$
IRM: h_d(I;\Theta_d) \to \left\{ \hat{A}, \hat{N}, \hat{L} \right\}
$$

$$
Direct Renderer: f_d( \hat{A}, \hat{N}, \hat{L}) \to \hat{I_d}
$$

$$
RAR: f_r(I, \hat{A}, \hat{N}; \Theta_r) \to \hat{I_r}
$$

以下の式が self-supervised reconstruction loss。

$$
L_u = ||I - (\hat{I_d}+\hat{I_r})||_{1}
$$

## How it is validated （experimental setup and results）
#### 他の論文との比較
より正確な法線と陰影。  
反射率の曖昧さを解消している。  
これは deep CNN を使用しているため。

IIW をテストセットとして比較  
WHDR（Weighted Human Disagreement Rate）を評価して、優れていることが確認出来る。

アルベド、法線ベクトル、環境マップ（合成データ、実データ）全てで以前の研究より勝っている。

## Limitations
単一オブジェクトに対するものではないが、シーンは屋内シーンに限定されている。

## What you thought
要するに、データセットを向上させて既知の学習方法を色々組み合わせたら今までより精度が上がった。というだけに聞こえるが、そういうものなのか？

## Papers to read before and after the work
#### この論文を引用している論文
* CVPR2019: [Putting Humans in a Scene: Learning Affordance in 3D Indoor Environments](https://arxiv.org/abs/1903.05690)

#### 参考文献
* ECCV2018: [CGIntrinsics: Better Intrinsic Image Decomposition Through Physically-Based Rendering](https://arxiv.org/abs/1808.08601)
* CVPR2018: [SfSNet: Learning Shape, Reflectance and Illuminance of Faces 'in the Wild'](https://www.semanticscholar.org/paper/SfSNet%3A-Learning-Shape%2C-Reflectance-and-Illuminance-Sengupta-Kanazawa/074619ffc19894c13974321d4b31144acc212f91)
* CVPR2017: [Physically-Based Rendering for Indoor Scene Understanding Using Convolutional Neural Networks](https://www.semanticscholar.org/paper/Physically-Based-Rendering-for-Indoor-Scene-Using-Zhang-Song/5b8d3a05d6f25158fff84bc4ef64fd12d92abc2f)
* CVPR2017: [Semantic Scene Completion from a Single Depth Image](https://www.semanticscholar.org/paper/Semantic-Scene-Completion-from-a-Single-Depth-Image-Song-Yu/8a05db7a75c65ee61c3ca7a6e5401b946166290d)
