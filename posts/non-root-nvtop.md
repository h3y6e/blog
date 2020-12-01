@def title = "nvtopを非rootでインストール"
@def date = Date(2020,01,28)
@def tags = ["memo"]
@def rss = "nvtopを研究室のGPUサーバーにインストールした"

htopのnvidia-smi版的なやつ: [nvtop](https://github.com/Syllo/nvtop) \\
いい感じになるのでオススメ

```bash
$ git clone https://github.com/Syllo/nvtop.git
$ cd nvtop
$ cmake -DCMAKE_INSTALL_PREFIX=$HOME/local
$ make
$ make install
```
その後`.zshrc`等に
```vim
export PATH=$PATH:$HOME/local/bin
```
を書いて反映させる
