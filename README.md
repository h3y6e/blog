# Blog

heyhoe's blog.

[![Production](https://github.com/h3y6e/blog/workflows/Production/badge.svg)](https://github.com/h3y6e/blog/actions?query=workflow%3A%22Production%22)

A static site built with [Vite+](https://viteplus.dev) and self-made packages.

## Setup

Install `vp` with [mise](https://mise.jdx.dev). `vp` manages Node.js and pnpm by itself.

```sh
mise install
vp install
```

## Development

```sh
vp dev      # dev server
vp test     # tests
vp check    # format, lint, and type checks
vp run lint # textlint for posts
```

## Production Build

```sh
vp build    # outputs to site/dist
```

## LICENSE

[MIT License](./LICENSE)

`Blog`'s theme is derived from the
[`hugo-theme-terminal`](https://github.com/panr/hugo-theme-terminal/)
[(MIT License)](https://github.com/panr/hugo-theme-terminal/blob/master/LICENSE.md).

The font for `Blog`'s OG images is [`Firge35`](https://github.com/yuru7/Firge)
[(SIL OPEN FONT LICENSE)](https://github.com/yuru7/Firge/blob/master/LICENSE).
