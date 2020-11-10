@def author = "Hiroya Kawase"
@def mintoclevel = 2
@def maxtoclevel = 3
@def tag_page_path = "tags"
@def ignore = ["node_modules/", "franklin", "franklin.pub"]
@def prepath = "blog"

<!--
Add here global page variables to use throughout your
website.
The website_* must be defined for the RSS to work
-->
@def website_title = "#a5ebec"
@def website_descr = "heyhoe's pothooks"
@def website_url   = "https://5ebec.github.io/blog/"

<!--
Add here global latex commands to use throughout your
pages. It can be math commands but does not need to be.
For instance:
* \newcommand{\phrase}{This is a long phrase to copy.}
-->
\newcommand{\R}{\mathbb R}
\newcommand{\scal}[1]{\langle #1 \rangle}
\newcommand{\blurb}[1]{
    ~~~
    <span style="font-size:24px;font-weight:300;">!#1</span>
    ~~~
}
\newcommand{\refblank}[2]{
    ~~~
    <a href="!#2" target="_blank" rel="noopener noreferrer">#1</a>
    ~~~
}
\newcommand{\lineskip}{@@blank@@}
\newcommand{\skipline}{\lineskip}
\newcommand{\note}[1]{@@note @@title ⚠ Note@@ @@content #1 @@ @@}

\newcommand{\smindent}[1]{\span{width:45px;text-align:right;color:slategray;}{#1}}
\newcommand{\smnote}[1]{\style{font-size:85%;line-height:0em;}{#1}}