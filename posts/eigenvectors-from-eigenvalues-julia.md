@def title = "Eigenvectors from Eigenvalues を Julia で検証する"
@def date = Date(2019, 11, 19)
@def tags = ["julia"]
@def rss = "Twitter で話題になったり研究室の slack で話されたりしていたので Julia で書いてみた"

 - [Eigenvectors from Eigenvalues](https://arxiv.org/pdf/1908.03795.pdf)
 - Peter B. Denton, Stephen J. Parke, Terence Tao, Xining Zhang

$n$ 番煎じだと思うが， Julia で検証してみる．

この論文の重要な部分は **Lemma 2** である．

$$
|v_{i,j}|^2 \prod_{k = 1; k \neq i}^n{(\lambda_i(A) - \lambda_k(A))} = \prod_{k = 1}^{n-1}{(\lambda_i(A) - \lambda_k(M_j))}
$$

ただし，
 - $A$ : $n \times n$ のエルミート行列
 - $\lambda_i(A)$ : $A$ の $i$ 番目の固有値
 - $v_{i,j}$ : $\lambda_i(A)$ に対する固有ベクトル $v_i$ の $j$ 番目の要素
 - $M_j$ : $A$ から第 $j$ 行と第 $j$ 列を除去して得られた主小行列

この関係式により，固有値(と主小行列固有値)から固有ベクトル(の成分の二乗ノルム)を計算する事が出来る．

## 実行環境
```julia
versioninfo()
```
```
Julia Version 1.2.0  
Commit c6da87ff4b (2019-08-20 00:03 UTC)  
Platform Info:  
  OS: macOS (x86_64-apple-darwin18.6.0)  
  CPU: Intel(R) Core(TM) i7-8569U CPU @ 2.80GHz  
  WORD_SIZE: 64  
  LIBM: libopenlibm  
  LLVM: libLLVM-6.0.1 (ORCJIT, skylake)
```

## 準備
行列をシンプルに表示するため，`printarr` 関数を作成しておく．
```julia
using Test
using LinearAlgebra
using RandomMatrices
printarr(arr) = Base.print_array(IOContext(stdout, :compact => true), arr)
```

## エルミート行列 $A$ を生成
[JuliaMath/RandomMatrices.jl](https://github.com/JuliaMath/RandomMatrices.jl) パッケージの `GaussianHermite` を用いてランダムなエルミート行列を生成する．
```julia
N = 3
A = rand(GaussianHermite(2), N)
printarr(A)
```
```
-0.28791+0.0im         -0.33357-0.328261im  0.145503-0.673825im  
 -0.33357+0.328261im  -0.0486213+0.0im       0.517909-0.340381im  
 0.145503+0.673825im    0.517909+0.340381im  0.910566+0.0im   
```

## $A$ の固有値, 固有ベクトルを求める
固有値及び固有ベクトルは Standard Library である [LinearAlgebra](https://docs.julialang.org/en/v1/stdlib/LinearAlgebra/) の `eigvals` 関数 と `eigvecs` 関数 で求められる．また，`eigen` 関数でも取得することが出来る．
```julia
println("固有値(eigvals)")
λ = eigvals(A)
printarr(λ)
println("\n固有ベクトル(eigvecs)")
v = eigvecs(A)
printarr(v)
println("\nまたは，\n固有値(eigen)")
F = eigen(A)
printarr(F.values)
println("\n固有ベクトル(eigen)")
printarr(F.vectors)
```
```
固有値(eigvals)
 -0.944382 
  0.0428349
  1.47558  
固有ベクトル(eigvecs)
 -0.441809+0.582701im   -0.52481-0.228541im  -0.0214358-0.370334im
 -0.178221+0.52824im    0.665628+0.309546im    0.371178-0.112014im
  0.393018-0.0im       -0.365327-0.0im         0.843844+0.0im     
または，
固有値(eigen)
 -0.944382 
  0.0428349
  1.47558  
固有ベクトル(eigen)
 -0.441809+0.582701im   -0.52481-0.228541im  -0.0214358-0.370334im
 -0.178221+0.52824im    0.665628+0.309546im    0.371178-0.112014im
  0.393018-0.0im       -0.365327-0.0im         0.843844+0.0im     
```

## $A$ の主小行列 $M_j$
```julia
A[1:N .!= j, 1:N .!= j]
```
または
```julia
A[setdiff(1:N, j), setdiff(1:N, j)]
```
のように記述することで， $M_j$ を表現することができる．
```julia
M = zeros(Complex{Float64}, N-1, N-1, N)
for j = 1:N
    M[:,:,j] = A[1:N .!= j, 1:N .!= j]
    println("j = $j")
    printarr(M[:,:,j])
    println()
end
```
```
j = 1
 -0.0486213+0.0im       0.517909-0.340381im
   0.517909+0.340381im  0.910566+0.0im     
j = 2
 -0.28791+0.0im       0.145503-0.673825im
 0.145503+0.673825im  0.910566+0.0im     
j = 3
 -0.28791+0.0im         -0.33357-0.328261im
 -0.33357+0.328261im  -0.0486213+0.0im   
```

## Lemma 2 (再掲)
$$
|v_{i,j}|^2 \prod_{k = 1; k \neq i}^n{(\lambda_i(A) - \lambda_k(A))} = \prod_{k = 1}^{n-1}{(\lambda_i(A) - \lambda_k(M_j))}
$$

### 左辺
```julia
lhs = abs2.(v) .* [prod(λ[i] - λ[k] for k = 1:N if k != i) for j = 1:N, i = 1:N]
printarr(lhs)
```
```
 1.2775    -0.463448  0.477111
 0.742511  -0.762209  0.521191
 0.369018  -0.188776  2.4689  
```

### 右辺
```julia
rhs = [prod(λ[i] - eigvals(M[:,:,j])[k] for k = 1:N-1) for j = 1:N, i = 1:N]
printarr(rhs)
```
```
 1.2775    -0.463448  0.477111
 0.742511  -0.762209  0.521191
 0.369018  -0.188776  2.4689  
```

## 両辺比較
```julia
@test lhs ≈ rhs
```
```
Test Passed
```