---
name: blog-writer
description: Turn Obsidian `log` vault notes and optional references into a blog post draft for this repository. Use this for articles based on recent work, task notes, daily notes, implementation history.
---

# Blog Writer

Write a post for this repository from working notes and supporting references.
Treat the Obsidian `log` vault as the main source of truth. Use GitHub or web sources when they strengthen accuracy, context, or technical detail, including private repositories when accessible.

## Inputs

- Accept a topic or angle plus optional sources.
- Accept `task/*.md`, `daily/*.md`, search terms, GitHub PR or issue URLs, commit URLs, `owner/repo#123`, and `owner/repo@sha`.
- If the request is vague, search `task/` and `daily/` before asking.

## Workflow

1. Read the latest 3-5 relevant posts in `posts/`.
   Prefer files whose names do not start with `YYYYMMDD-` when learning voice.
   Use dated posts mainly for newer formatting or topic treatment.
2. Search and read the relevant `log` notes.
3. Decide the one pain, surprise, or realization that makes the article worth writing.
4. Keep only the details that explain that point.
5. Add GitHub or web sources when they improve accuracy, context, reproducibility, or concreteness.
6. Draft the article in Japanese and save it to `posts/YYYYMMDD-<slug>.md`.

## Source Gathering

- Obsidian `log`:
  use `obsidian search:context vault=log query="..." path="task"` and `path="daily"`, then `obsidian read vault=log path="..."`.
  Prefer task notes for goals, decisions, validation, and conclusions.
  Prefer daily notes for chronology and surrounding context.
- GitHub and web:
  use them as supporting sources, not the only source.
  GitHub sources may be public or private if they are accessible in the current environment.
  For PRs use `gh pr view` and `gh pr diff`; for issues use `gh issue view`; for commits prefer `git show`.
  If `owner/repo#123` is ambiguous, check PR first, then issue.
  Verify technical claims with official docs or reliable web sources.

## Writing Rules

- Match recent `posts/` for tone, structure, frontmatter, links, and code block usage.
- Give the most weight to non-`YYYYMMDD-` posts when imitating voice.
- Write in Japanese as personal notes, not generic advice.
- Start from the pain, constraint, or realization. Explain why before how.
  Prefer one strong angle over exhaustive coverage.
- Use one or two concrete moments from notes when they reveal the real decision. Cut details that are merely true but not important.
- Avoid changelog-first structure unless the article is actually a checklist.
- Keep the prose repo-specific and direct.
  If the strongest references are terse, keep the article terse too.
  Short declarative sentences, judgment first, light casualness, and sparse transitions are fine when the source voice supports them.
- Keep English mostly to identifiers, commands, quoted text, and established terms. Prefer natural Japanese in normal prose.
- Sanitize private notes before using them.
  Never publish secrets, private URLs, personal names, account identifiers, internal feature names, internal spec titles, local-only paths, or task note filenames unless the user explicitly wants them published.

## Output

- Save a Markdown file to `posts/YYYYMMDD-<slug>.md`.
- Frontmatter must include `title`, `date`, `tags`, and `rss_description`.
- Infer tags from the actual topic or technologies.
- Include references in the article body when they are publishable and useful.
- Use `{{ embed URL }}` only for especially important references.

## Final Check

- The article matches recent `posts/` style.
- The opening makes clear why the article exists.
- The main decision or realization is obvious.
- The requested angle is preserved.
- Private material has been sanitized.
