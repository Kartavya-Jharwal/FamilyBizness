# FamilyBizness

Wealth management for the single-family office — estate planning and family-business financial affairs across generations.

Canonical facts: [`docs/00 - Canonical/Identity.md`](docs/00%20-%20Canonical/Identity.md).

## Quick start

Requires [Bun](https://bun.sh).

```bash
bun install
bun install --cwd apps/portfolio
bun run dev       # parent shell only: http://localhost:3000
bun run build     # builds the shell and portfolio into dist/
bun run preview   # combined preview: http://localhost:4173
```

The browser-local MVP opens one prepared family office with a charter selected from four constitutions, governance/succession, estate and trust planning, financial consolidation, portfolio analytics, a shared office calendar/task register, stewardship reviews and board exports. Golden Bird, Calcot / Stone, Sandoval and Vasnani supply the selected operating provisions; visitor profiles share the office records. No donor server or real financial/authentication service is required.

## Live preview (GitHub Pages)

Deployed via Actions (`pages.yml`):

- **https://kartavya.tech/FamilyBizness/**
- Mirror: https://kartavya-jharwal.github.io/FamilyBizness/

Pages source: **GitHub Actions** (already enabled).

## Layout

| Path | Role |
|------|------|
| `apps/web` | Brand-first entry, continuity narrative and platform guide |
| `apps/portfolio` | Adapted portfolio demo, built with Bun and Vite |
| `packages/tokens` | Design tokens (single file) |
| `upstream/` | Origins and attribution for shared donor-derived foundations |
| `docs/` | Markdown docs (numbered folders) |
| `donor/contenders/` | Local contender clones — **not committed** |
| `.github/workflows/pages.yml` | Deploy `dist/` to Pages |

## Docs index

- [Identity](docs/00%20-%20Canonical/Identity.md)
- [Architecture](docs/03%20-%20Architecture/Architecture.md)
- [Trace](docs/03%20-%20Architecture/Trace.md)
- [Design](docs/04%20-%20Design/Design.md)
- [Pillars](docs/05%20-%20Requirements/Pillars.md)
- [Auth Flow](docs/05%20-%20Requirements/Auth%20Flow.md)
- [MVP Feature Scope](docs/05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md)

## Release verification

```bash
bun run donor:verify
```

- [MVP acceptance](docs/05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md)
- [Actual donor frontend/code ledger](docs/03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md)
- [Case and constitution setup](docs/05%20-%20Requirements/Cases%20-%20Setup%20And%20Constitution%20Management.md)

## Contender workflow

```bash
cd donor/contenders
git clone <url> <name>
```

Then refactor to static UI and fit into `apps/web`. Details: [`donor/contenders/README.md`](donor/contenders/README.md).

## Agent rules

See [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md).
