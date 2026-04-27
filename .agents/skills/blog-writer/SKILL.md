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
   If the closest voice match is exploratory, prefer that flow over a polished
   essay voice.
2. Search and read the relevant `log` notes.
   Do not stop at a single task note if the surrounding context is still thin.
3. Expand to adjacent daily notes, related task notes, and nearby decisions until
   you can explain why this work mattered.
4. Decide the one pain, surprise, or realization that makes the article worth
   writing.
5. Build one story around that point, with enough setup that a reader without the
   immediate work context can still follow it.
6. Add GitHub or web sources when they improve accuracy, context,
   reproducibility, or concreteness.
7. Draft the article in Japanese and save it to `posts/YYYYMMDD-<slug>.md`.

## Source Gathering

- Obsidian `log`:
  use `obsidian search:context vault=log query="..." path="task"` and `path="daily"`, then `obsidian read vault=log path="..."`.
  Prefer task notes for goals, decisions, validation, and conclusions.
  Prefer daily notes for chronology and surrounding context.
  If one note explains the change but not the setup or motivation, keep searching
  related notes until the story is understandable on its own.
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
- Prefer an exploratory flow when it fits the source material:
  background, what you noticed, what you tried, and what still feels open.
  Do not polish the article into a thesis if the repo's natural voice is closer
  to thought process and experiment notes.
- When matching exploratory posts such as `posts/comment-on-nostr.md`, preserve the
  author's position in the story: what they first misunderstood, why they reopened
  the topic, what felt amusing or awkward, and what remains unresolved. The article
  should feel like a person thinking through an experiment, not a finished product
  memo.
- Prefer thought-order structure over explanation-order structure when the source
  material supports it. Useful shapes include: `はじめに` / context, question or
  hypothesis, experiment or implementation, then issues or open questions. Avoid
  section titles that are full-sentence takeaways; use short topic labels instead.
- Each post should tell one story.
  Do not stack several loosely related updates into one article.
- Include the minimum setup needed for an outsider or future you to understand
  why the article exists.
  If that setup is missing, gather more notes before drafting.
- Use one or two concrete moments from notes when they reveal the real decision. Cut details that are merely true but not important.
- Avoid changelog-first structure unless the article is actually a checklist.
- Avoid over-summarizing your own conclusion.
  Let the observations, examples, and small turns in reasoning carry the story.
- Do not repeat the same takeaway in the body and conclusion. If the point has
  already landed, end with the remaining uncertainty, next experiment, or operational
  caveat instead of restating the thesis.
- Keep the prose repo-specific and direct.
  If the strongest references are terse, keep the article terse too.
  Short declarative sentences, light casualness, sparse transitions, and a bit
  of tentativeness are fine when the source voice supports them.
- Calibrate confidence carefully: verify technical facts and state them plainly,
  but keep interpretations, product bets, and personal taste slightly provisional
  when the source voice is exploratory. Avoid polished phrases that sound like an
  explainer article rather than the author's own note.
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
- The article stands on its own without assuming too much hidden context.
- The main decision or realization is obvious.
- The article reads as one coherent story rather than a bundle of notes.
- The requested angle is preserved.
- Private material has been sanitized.
