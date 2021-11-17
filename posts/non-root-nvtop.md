+++
title = "nvtopを非rootでインストール"
date = Date(2020,01,28)
tags = ["memo"]
rss_description = "nvtopを研究室のGPUサーバーにインストールした。"
+++

htopのnvidia-smi版的なやつ： [nvtop](https://github.com/Syllo/nvtop) \\
いい感じになるのでオススメ。

```bash
$ git clone https://github.com/Syllo/nvtop.git
$ cd nvtop
$ cmake -DCMAKE_INSTALL_PREFIX=$HOME/local
$ make
$ make install
```
その後 `.zshrc` 等に以下を書いて反映させる。
```vim
export PATH=$PATH:$HOME/local/bin
```
