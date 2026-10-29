# Architecture

## Monorepo layout

```
FamilyBizness/
  apps/web/              # Bun static preview → GitHub Pages
  apps/portfolio/        # Adapted portfolio demo (Bun + Vite)
  packages/tokens/       # ONE design-tokens file (tokens.css)
  upstream/              # provenance for shared donor-derived foundations
  docs/                  # Markdown only (no mkdocs yet)
  donor/contenders/      # gitignored clones for ingest (not committed)
  scripts/               # build / dev / preview for web
  .github/workflows/     # Pages deploy
```

## Preview app

- **`apps/web`** is the live MVP *shell*: brand hero, legacy page stub, login → splash → verify stubs, pillar nav stubs.
- Built with Bun into repo-root `dist/`; deployed by GitHub Actions to GitHub Pages.
- Project Pages base path: `/FamilyBizness` (set via `GITHUB_PAGES=1` / `BASE_PATH` in CI).
- The login stub links to the static portfolio demo at `/portfolio/`. Its fictional sample data is local to the browser; it is not an authenticated service.
- The portfolio donor uses sample family-office accounts, holdings and goals to evaluate its existing screens. The parent-shell capability links remain stubs until their modules are integrated.
- The parent build builds `apps/portfolio` and copies its output into the Pages artifact. Install its dependencies separately before building.
- The shell and the portfolio default Classic theme share foundations in `packages/tokens/tokens.css`. `upstream/` records their donor origin; alternate portfolio themes retain their own definitions.

## Contender ingest path

Portfolio (`apps/portfolio`) is the main application for incoming feature donors; `apps/web` remains its entry shell and Pages packaging boundary. Preserve donor snapshots locally and record provenance rather than adding standalone production silos. The third donor contributes the lazy constitution workspace, with local document state and explicitly activated IPS checks at the local financial mutation boundary: [Policy Module - Donor Audit And Integration Plan](../02%20-%20Strategy/Policy%20Module%20-%20Donor%20Audit%20And%20Integration%20Plan.md). Full compiler cleanup is tracked separately in [Portfolio - Type Checking Repair Plan](../02%20-%20Strategy/Portfolio%20-%20Type%20Checking%20Repair%20Plan.md).

1. Clone full contender apps into `donor/contenders/<name>/` (never commit clones).
2. Refactor each contender toward a **static web UI**.
3. Fit surviving feature modules into `apps/portfolio` under shared navigation and tokens; package through the existing `apps/web` build.

Do **not** vibe-code the full product from scratch. Prefer extract → static → integrate.

## Incoming finance, calendar and simulation donors

The next donor preparation tracks are ERPNext for finance/operations workflows, cal.diy for an obligations calendar, and a standalone Bun/browser simulation scaffold. They remain local under `donor/contenders/` until selected features are adapted into the portfolio host. The requested capability and ownership contract is recorded in [MVP Feature Scope](../05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md#next-donor-scope).

Accounting systems own accounting records and cash-flow/income statements; trading systems own trade logs. FamilyBizness is intended to consume source-linked observations, connect them with IPS findings and risk review, and present family-office workflows. Connector buttons, consent and sync previews must not imply a live integration. Manual bookkeeping entry is delegated to the source accounting workflow rather than a second local ledger. Simulation results are an independent scenario output and must not overwrite source financial observations.

## Documentation

Markdown under `docs/` with numbered, function-named folders. Canonical facts: [`../00 - Canonical/Identity.md`](../00%20-%20Canonical/Identity.md). Traceability stub: [Trace.md](Trace.md).

## Analysis donor boundary

The retained Ghostfolio workflows are adapted to React inside the host portfolio's Insights workspace. Host adapters, account scope, Performance period, theme and formatting supply the inputs; only profile-scoped rule preferences are new state. The standalone donor remains a local reference and is not bundled. Mapping, verification and unavailable provider/evaluator capabilities are recorded in [Ghostfolio - Integration Plan](../02%20-%20Strategy/Ghostfolio%20-%20Integration%20Plan.md).

The scripted assistant terminates locally in a fixed theatrical failure. Sample financial reads derive from the current browser account set; there is no second analysis ledger. The repeatable test/build/legal checkpoint is [Donor - Combined Pass Sign-Off](../02%20-%20Strategy/Donor%20-%20Combined%20Pass%20Sign-Off.md).
