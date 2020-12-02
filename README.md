# Blog
heyhoe's pothooks

## Dev
### Franklin.jl
```julia
julia> ]
(blog) Pkg> activate .
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

### Style (PostCSS)
```sh
$ yarn install
$ yarn dev:css
```

## LICENSE
[MIT License](./LICENSE)

`Blog` is built using the SSG [`Franklin.jl`](https://github.com/tlienart/Franklin.jl) [(MIT License)](https://github.com/tlienart/Franklin.jl/blob/master/LICENSE.md).

`Blog`'s theme is derived from the [`hugo-theme-terminal`](https://github.com/panr/hugo-theme-terminal/) [(MIT License)](https://github.com/panr/hugo-theme-terminal/blob/master/LICENSE.md).