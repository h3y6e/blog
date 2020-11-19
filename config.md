<!--
global page variables
-->
@def author = "5ebec"
@def author_url = "https://a5e.be/c"
@def website_title = "#a5ebec"
@def website_descr = "へいほぅの殴り書き"
@def website_url = "https://5ebec.github.io/blog/"
@def tag_page_path = "tags"
@def date_format = "u dd, yyyy"
@def mintoclevel = 2
@def maxtoclevel = 3

<!--
Add here files or directories that should be ignored by Franklin, otherwise
these files might be copied and, if markdown, processed by Franklin which
you might not want. Indicate directories by ending the name with a `/`.
-->
@def ignore = ["node_modules/", ".prettierignore", "package.json", "prettierrc.yml", "yarn.lock", "franklin", "franklin.pub"]

<!--
Add here global latex commands to use throughout your
pages. It can be math commands but does not need to be.
For instance:
* \newcommand{\phrase}{This is a long phrase to copy.}
-->
\newcommand{\R}{\mathbb R}
\newcommand{\scal}[1]{\langle #1 \rangle}
