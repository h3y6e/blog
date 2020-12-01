<!--
global page variables
-->
@def author = "5ebec"
@def author_url = "https://a5e.be/c"
@def website_title = "#a5ebec"
@def website_descr = "へいほぅの殴り書き"
@def website_url = "https://blog.5ebec.dev/"
@def tag_page_path = "tags"
@def date_format = "yyyy-mm-dd"
@def mintoclevel = 2
@def maxtoclevel = 3


<!--
Add here files or directories that should be ignored by Franklin, otherwise
these files might be copied and, if markdown, processed by Franklin which
you might not want. Indicate directories by ending the name with a `/`.
-->
@def ignore = [".vscode/", "node_modules/", "theme/", ".prettierignore",
    ".prettierrc.yml", "package.json", "postcss.config.js", "yarn.lock"]

<!--
Add here global latex commands to use throughout your
pages. It can be math commands but does not need to be.
For instance:
* \newcommand{\phrase}{This is a long phrase to copy.}
-->
\newcommand{\R}{\mathbb R}
\newcommand{\scal}[1]{\langle #1 \rangle}
