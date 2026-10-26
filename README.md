# FamilyBizness

Wealth management for the single-family office — estate planning and family-business financial affairs across generations.

Canonical facts: [`docs/00 - Canonical/Identity.md`](docs/00%20-%20Canonical/Identity.md).

## Quick start

Requires [Bun](https://bun.sh).

```bash
bun install
bun run dev       # http://localhost:3000
bun run build     # → dist/
bun run preview   # http://localhost:4173
```

## Live preview (GitHub Pages)

After Actions deploy:

**https://kartavya-jharwal.github.io/FamilyBizness/**

(Enable Pages → Source: GitHub Actions if the first deploy needs a one-time settings click.)

## Layout

| Path | Role |
|------|------|
| `apps/web` | Minimal Bun static MVP shell |
| `packages/tokens` | Design tokens (single file) |
| `docs/` | Markdown docs (numbered folders) |
| `donot/contenders/` | Local contender clones — **not committed** |
| `.github/workflows/pages.yml` | Deploy `dist/` to Pages |

## Docs index

- [Identity](docs/00%20-%20Canonical/Identity.md)
- [Architecture](docs/03%20-%20Architecture/Architecture.md)
- [Trace](docs/03%20-%20Architecture/Trace.md)
- [Design](docs/04%20-%20Design/Design.md)
- [Pillars](docs/05%20-%20Requirements/Pillars.md)
- [Auth Flow](docs/05%20-%20Requirements/Auth%20Flow.md)

## Contender workflow

```bash
cd donot/contenders
git clone <url> <name>
```

Then refactor to static UI and fit into `apps/web`. Details: [`donot/contenders/README.md`](donot/contenders/README.md).

## Agent rules

See [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md).
