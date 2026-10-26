# Architecture

## Monorepo layout

```
FamilyBizness/
  apps/web/              # Bun static preview → GitHub Pages
  packages/tokens/       # ONE design-tokens file (tokens.css)
  docs/                  # Markdown only (no mkdocs yet)
  donot/contenders/      # gitignored clones for ingest (not committed)
  scripts/               # build / dev / preview for web
  .github/workflows/     # Pages deploy
```

## Preview app

- **`apps/web`** is the live MVP *shell*: brand hero, legacy page stub, login → splash → verify stubs, pillar nav stubs.
- Built with Bun into repo-root `dist/`; deployed by GitHub Actions to GitHub Pages.
- Project Pages base path: `/FamilyBizness` (set via `GITHUB_PAGES=1` / `BASE_PATH` in CI).

## Contender ingest path

1. Clone full contender apps into `donot/contenders/<name>/` (never commit clones).
2. Refactor each contender toward a **static web UI**.
3. Fit surviving UI/modules into `apps/web` (or future `apps/*`) under FamilyBizness navigation and tokens.

Do **not** vibe-code the full product from scratch. Prefer extract → static → integrate.

## Docs

Markdown under `docs/` with numbered, function-named folders. Canonical facts: [`../00 - Canonical/Identity.md`](../00%20-%20Canonical/Identity.md). Traceability stub: [Trace.md](Trace.md).
