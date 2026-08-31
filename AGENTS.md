- Use `vp` for everything, never npm/pnpm — vp provisions the pinned pnpm.
- `packages/*` stay zero-dependency (workspace deps only): extend md/math/hl instead of adding libraries.
- `packages/md/test/golden/` was generated once with marked (since removed); do not regenerate — adjust normalization in `mask.ts` for divergences.
- Support target: Baseline Newly available, used natively, no fallback/polyfills; browsers below unsupported.
- Sub-Baseline (limited availability, Chromium-only) features are optional enhancements only: must degrade to "feature absent" at zero cost to unsupported browsers, else not adopted.
  - Exception: a ponyfill polluting no globals; global-mutating polyfills never adopted, at any Baseline level.
- Origin Trials encouraged, if the page works after token expiry. Tokens live in `originTrials` in `site/vite.config.ts`; build warns near expiry, fails on expired.

- `feed.xml` must stay byte-identical to the live feed; `rss.ts` uses plain string literals since the `html` tagged template gets reformatted by oxfmt.
- Page URLs (`/posts/<slug>/`, `/tags/<tag>/`) are permanent; asset URLs are hashed and free to change.
