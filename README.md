# Blog

heyhoe's blog.

[![Production](https://github.com/h3y6e/blog-spikey/workflows/Production/badge.svg)](https://github.com/h3y6e/blog-spikey/actions?query=workflow%3A%22Production%22)

## Prerequisites

- [mise](https://mise.jdx.dev/) for managing Julia and Bun versions
- Julia packages: `julia -e 'using Pkg; Pkg.activate("."); Pkg.instantiate();'`
- Node packages: `bun install`

## Development

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
$ mise run dev:franklin
```

### CSS, JS, etc.

```sh
# Watch CSS changes
$ mise run dev:css
# Watch JS changes
$ mise run dev:swc
```

## Production Build

```sh
# Build everything for production
$ mise run prod
```

## LICENSE

[MIT License](./LICENSE)

`Blog` is built using the SSG
[`Franklin.jl`](https://github.com/tlienart/Franklin.jl)
[(MIT License)](https://github.com/tlienart/Franklin.jl/blob/master/LICENSE.md).

`Blog`'s theme is derived from the
[`hugo-theme-terminal`](https://github.com/panr/hugo-theme-terminal/)
[(MIT License)](https://github.com/panr/hugo-theme-terminal/blob/master/LICENSE.md).

The font for `Blog`'s OG images is [`Firge35`](https://github.com/yuru7/Firge)
[(SIL OPEN FONT LICENSE)](https://github.com/yuru7/Firge/blob/master/LICENSE).
