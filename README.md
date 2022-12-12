# Blog

heyhoe's pothooks.

## Prd（GitHub Pages）

[![Production](https://github.com/h3y6e/blog/workflows/Production/badge.svg)](https://github.com/h3y6e/blog/actions?query=workflow%3A%22Production%22)

URL: https://blog.h3y6e.com

## Stg（Cloudflare Pages）

[![Staging](https://github.com/h3y6e/blog/workflows/Staging/badge.svg)](https://github.com/h3y6e/blog/actions?query=workflow%3A%22Staging%22)

Latest staging site's URL: https://stg.pages.dev

## Dev

### Franklin.jl

```sh
julia> ]
(blog) Pkg> activate .
(blog) Pkg> instantiate
julia> using Franklin
julia> serve()
→ Initial full pass...
→ Starting the server...
✓ LiveServer listening on http://localhost:8000/ ...
  (use CTRL+C to shut down)
```

or

```sh
$ julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate();'
$ yarn install
$ yarn dev:franklin
```

### Style（PostCSS）

```sh
$ yarn install
$ yarn dev:css
```

## LICENSE

[MIT License](./LICENSE)

`Blog` is built using the SSG
[`Franklin.jl`](https://github.com/tlienart/Franklin.jl)
[(MIT License)](https://github.com/tlienart/Franklin.jl/blob/master/LICENSE.md).

`Blog`'s theme is derived from the
[`hugo-theme-terminal`](https://github.com/panr/hugo-theme-terminal/)
[(MIT License)](https://github.com/panr/hugo-theme-terminal/blob/master/LICENSE.md).

The font for the `Blog`'s OG image is
[`Firge35`](https://github.com/yuru7/Firge)
[(SIL OPEN FONT LICENSE)](https://github.com/yuru7/Firge/blob/master/LICENSE).
