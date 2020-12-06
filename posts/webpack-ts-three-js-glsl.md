+++
title = "webpack + typescript + three.jsでGLSL (.frag|.vert) を外部モジュールとしてimportする"
date = Date(2019,11,14)
tags = ["webpack", "typescript", "threejs", "glsl"]
rss = "typescript + three.jsでGLSLをいい感じに編集したい。"
+++

## まとめ

 - 型定義ファイルを用意
 - `raw-loader`を使用


## はじめに
three.jsで [ShaderMaterial](https://threejs.org/docs/#api/en/materials/ShaderMaterial) や [RawShaderMaterial](https://threejs.org/docs/#api/en/materials/RawShaderMaterial) を使うと、自作したGLSLを利用することが出来る。  
公式ドキュメントで紹介されている方法や、「[three.js glsl](https://lmgtfy.com/?q=three.js+glsl&s=g)」とかで検索して出てくる大抵の記事にはhtmlやjsに直書きしている例が見られる。
しかし、これではシンタックスハイライトは効かないし見栄えも良くない。


## .d.ts

型定義ファイル (`.d.ts`) を`.(frag|vert)`ファイルと同じ場所に用意。 
```
:
├── src
│   ├── glsl
│   │   ├── glsl.d.ts
│   │   ├── hoge.frag
│   │   └── hoge.vert
│   └── index.ts
:
```
 
ファイル名は適当で良いが、自分は`glsl.d.ts`とした。  
内容は以下の通り。
```ts
declare module '*.vert' {
    const src: string;
    export default src;
}
declare module '*.frag' {
    const src: string;
    export default src;
}
```
`.(vert|frag)`ファイルを外部モジュールとして`declare`キーワードでアンビエント宣言している。

`.ts`ファイルにimportする際のコードは以下のようになる。
```ts
import hoge_frag from "./glsl/hoge.frag";
import hoge_vert from "./glsl/hoge.vert";
```

## raw-loader

`.(ts|js)`ではないファイルをimportしたいので、 loaderが必要。

npmjs.comで ["shader loader webpack"](https://www.npmjs.com/search?q=shader%20loader%20webpack) と検索してみると、パッケージが10個ほど (2019/11/15現在）出てくる。  

が、単に`.vert`と`.frag`をimportしたいだけであれば、これらを使う必要はない。   
テキストをそのまま`string`として読み込みたいので、 [webpack-contrib/raw-loader](https://github.com/webpack-contrib/raw-loader) を用いる。

```shell
yarn add --dev raw-loader
```

`webpack.config.js`には以下のように記述する。
```js
// (略)
module: {
  rules: [
    {
      test: /.(ts|tsx|js)$/,
      use: 'ts-loader',
      include: [path.resolve(__dirname, 'src')],
      exclude: /node_modules/
    },
    {
      test: /.(vert|frag)$/,
      use: 'raw-loader',
      include: [path.resolve(__dirname, 'src')],
      exclude: /node_modules/
    }
  ]
},
// (略)
```

完成。  
よいシェーダーライフを。
