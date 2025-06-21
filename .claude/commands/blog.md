# Blog Writer

Analyzes single or multiple GitHub sources (PR, commit, issue) and generates
articles sharing practical technical insights. Matches the writing style of
existing articles in the `posts/` directory, written in Japanese as personal
notes without addressing readers directly.

## Process

1. Source Analysis

   - Parse single or multiple sources from arguments
   - Fetch diffs and context using `gh` command for each source
   - Automatically extract repository information from each source
   - Identify common themes, patterns, and technical insights across sources

2. Article Structure

   - Adjust focus based on specified direction
   - Technical challenges and solutions
   - Key implementation points and learnings
   - Code examples and best practices
   - Knowledge applicable to other developers

3. Content Development

   - Generate compelling title from implementation
   - Document problems solved and learnings
   - Include technology stack used
   - Add concrete implementation with code examples
   - Match writing style of existing articles in `posts/` directory
   - Write as personal notes in Japanese without addressing readers
   - Verify technical terms and concepts using WebSearch/WebFetch for accuracy
   - Include reference URLs using markdown links or `{{ embed URL }}` macro

4. Output Generation
   - Create article in Markdown format
   - Save to `posts/` directory with filename `$(date +%Y%m%d)-[slug].md`
   - Run lint:fix and lint checks

## Commands

```bash
# Generate from single source
/blog https://github.com/owner/repo/pull/123
/blog https://github.com/owner/repo/commit/abc123def

# Generate from multiple sources
/blog https://github.com/owner/repo/pull/123 owner/repo#456 owner/repo@abc123def
/blog https://github.com/owner/repo/commit/abc123 https://github.com/owner/repo/commit/def456

# Multiple sources with specified direction
/blog performance optimization analysis \
  https://github.com/owner/repo/pull/123 \
  https://github.com/owner/repo/pull/124 \
  https://github.com/owner/repo/commit/abc123def \
  owner/repo#456

# Mix different repositories
/blog comparing different approaches owner1/repo1#123 owner2/repo2#456
```

## Best Practices

1. Real Code: Always include implementation code
2. Context First: Explain why before how
3. Reproducible: Ensure examples are testable
4. Honest Reflection: Include failures and learnings
5. Practical Focus: Emphasize applicable knowledge
6. Version Awareness: Note specific versions used
7. Performance Data: Include metrics when relevant
8. Direction Consistency: Maintain specified direction throughout
9. Source Integration: Coherently integrate insights from multiple sources

## Process Details

```bash
# 1. Analyze writing style of recent articles in `posts/` directory
# Understand structure and style patterns of each article

# 2. Fetch content from GitHub URL (supports multiple sources)
# For PR
gh pr view [PR_URL] --json title,body,commits,files,additions,deletions,changedFiles
# For Commit
gh api repos/[owner]/[repo]/commits/[sha] --jq '{message,stats,files}'
# For Issue
gh issue view [ISSUE_URL] --json title,body,comments

# 3. Get detailed changes
gh pr diff [PR_URL]
# or
git show [commit_sha]
# or
gh api repos/[owner]/[repo]/compare/[base]...[head]
```

## Writing Style Reference

When generating articles, refer to recent article styles in `posts/` directory.

Elements to reference:

- Frontmatter format
- Section structure
- Writing style (personal notes in Japanese, use of past tense)
- Usage of embed macro
- Code example placement and explanation method

## Output Structure

Generated articles include the following elements:

1. Frontmatter: `title`, `date`, `tags`, `rss_description` are required

```markdown
+++
title = "RaycastでPLaMo翻訳を使う"
date = Date(2025, 06, 21)
tags = ["raycast"]
rss_description = "Script Command機能を使ってPLaMo翻訳CLIをRaycastから呼び出せるようにした"
+++
```

2. Body sections: Refer to structure of recent articles under `posts/`
3. External sources: Use markdown links and embed macro appropriately
4. Code examples: Excerpt from actual changes
5. Measurement data: Quantify performance and effectiveness

## Implementation Notes

- Parse GitHub URL patterns accurately (PR, Commit, Issue, etc.)
- Use gh CLI for authenticated access
- Dynamically learn writing style from latest ~5 articles
- Auto-infer tags from changes
- Excerpt and explain key parts when code changes exist
- Structure multiple sources chronologically or logically
- Organize performance data and measurements in tables
- Honestly include failures and trial-and-error
- Verify technical accuracy: Use `WebSearch`/`WebFetch` for unfamiliar terms,
  APIs, libraries, and implementation patterns
- Cross-reference official documentation when explaining technical concepts
- Citation practice: Always include referenced URLs in article body, not just as
  footnotes
- Use embed macro for important references (official docs, GitHub issues, etc.)

## GitHub URL Formats

Supported URL formats:

- `https://github.com/owner/repo/pull/123`
- `https://github.com/owner/repo/commit/abc123def`
- `https://github.com/owner/repo/issues/456`
- `owner/repo#123` (PR/Issue)
- `owner/repo@abc123def` (Commit)

## Post File Naming

Generated article filenames:

- `posts/YYYYMMDD-[generated-slug-from-title].md`
- Date uses execution date from `date +%Y%m%d` command
