+++
title = "pyenvでPython 3.4.3がインストールできない（Ubuntu 18.04）"
date = Date(2019,06,28)
tags = ["python","pyenv","ubuntu"]
rss_description = "Ubuntu18.04のpyenvでPython 3.4.3がインストールできなかったのでその解決法。"
+++

pyenvでPython 3.4.3をインストールしようとしたらこんなエラーが出た。
```shell
Downloading Python-3.4.3.tar.xz...
-> https://www.python.org/ftp/python/3.4.3/Python-3.4.3.tar.xz
Installing Python-3.4.3...
ERROR: The Python ssl extension was not compiled. Missing the OpenSSL lib?

Please consult to the Wiki page to fix the problem.
https://github.com/pyenv/pyenv/wiki/Common-build-problems


BUILD FAILED (Ubuntu 18.04 using python-build 1.2.12-2-geb68ec94)

Inspect or clean up the working tree at /tmp/python-build.20190629080825.2203
Results logged to /tmp/python-build.20190629080825.2203.log

Last 10 log lines:
(cd /home/5ebec/.anyenv/envs/pyenv/versions/3.4.3/share/man/man1; ln -s python3.4.1 python3.1)
if test "xupgrade" != "xno"  ; then \
	case upgrade in \
		upgrade) ensurepip="--upgrade" ;; \
		install|*) ensurepip="" ;; \
	esac; \
	 ./python -E -m ensurepip \
		$ensurepip --root=/ ; \
fi
Ignoring ensurepip failure: pip 6.0.8 requires SSL/TLS
```
エラーメッセージに書かれている https://github.com/pyenv/pyenv/wiki/common-build-problems 
にこんな項目があった。

[ERROR: The Python ssl extension was not compiled. Missing the OpenSSL lib?](https://github.com/pyenv/pyenv/wiki/common-build-problems#error-the-python-ssl-extension-was-not-compiled-missing-the-openssl-lib)

> If you're having trouble to get it to compile older python versions(<3.5) even after installing the recommended packages on ubuntu, changing the openssl lib might help:
```shell
sudo apt-get remove libssl-dev
sudo apt-get update
sudo apt-get install libssl1.0-dev
```

これっぽい。

以下を実行。

```shell
sudo apt remove libssl-dev
sudo apt update
sudo apt install libssl1.0-dev
```

再び `pyenv install 3.4.3` をしてみる。
```shell
Downloading Python-3.4.3.tar.xz...
-> https://www.python.org/ftp/python/3.4.3/Python-3.4.3.tar.xz
Installing Python-3.4.3...
Installed Python-3.4.3 to /home/5ebec/.anyenv/envs/pyenv/versions/3.4.3
```

解決。
