# FamilyBizness

**A legacy in motion.** An open-source wealth platform for the single-family office: estate planning and family-business financial affairs, kept together across generations.

- **Live demo:** [kartavya.tech/FamilyBizness](https://kartavya.tech/FamilyBizness/)
- **Canonical identity:** [`docs/00 - Canonical/Identity.md`](docs/00%20-%20Canonical/Identity.md)
- **Demo family:** the hypothetical Smiths, governed by the [Smith Family Constitution](docs/00%20-%20Canonical/Smith%20Family%20-%20Constitution.md)

FamilyBizness is a functional proof of concept for patriarchs and matriarchs, family boards, and the chief executives and managing directors of family businesses. It runs entirely in the browser. There is no server, real login or live financial feed, and nothing you enter leaves your device.

## What you can do in the demo

1. **Arrive.** The landing page tells the family story. On first visit it asks once whose family office this is: enter your surname or continue with the Smith demo.
2. **Sign in by role.** Pick a visitor profile (head of family, board member, business leader, adviser). Menus adapt to the role.
3. **Stewardship overview.** Net worth, a line graph of spending, liquidity, meetings and the family's policy signals on one cover page.
4. **Charter and policy.** Read the Smith Family Constitution article by article, alongside the investment policy statement summary.
5. **Goals.** Multi-generational goals with owners, dates and measures.
6. **Financials and models.** Balance sheet, income and cash flow; allocations, X-ray look-through and a stochastic scenario lab, with previews of how external data sources would connect.
7. **Settings.** Change the family surname and appearance, reset records, or **wipe and restart the demo**, which clears this site's local and session storage.
8. **Fork it.** Copy the [setup plan prompt](apps/web/public/Fork%20-%20Setup%20Plan.md) from the landing page into your own AI assistant to fork the repository and set it up privately for your own family.

A short walkthrough is in [Script - Product Demo](docs/07%20-%20Submission/Script%20-%20Product%20Demo.md).

## Quick start

Requires [Bun](https://bun.sh).

```bash
bun install
bun install --cwd apps/portfolio
bun run dev       # landing shell only: http://localhost:3000
bun run build     # landing and portfolio into dist/
bun run preview   # combined preview: http://localhost:4173
```

## Deploying

The live site is served by GitHub Pages from the `gh-pages` branch, which holds only the built `dist/`. Pushing to `main` does not deploy.

```powershell
$env:GITHUB_PAGES = '1'   # base path /FamilyBizness
bun run build
cd dist
git init -b gh-pages; git add -A; git commit -m "Deploy"
git push -f https://github.com/Kartavya-Jharwal/FamilyBizness.git gh-pages
Remove-Item -Recurse -Force .git
```

`dist/release.json` records when and from what each build was made. Any other static host works: upload `dist/` and set `BASE_PATH` to match the hosting path.

## Layout

| Path | Role |
|------|------|
| `apps/web` | Brand-first landing, family story, welcome screen, fork prompt, and search files (`robots.txt`, `sitemap.xml`, `llms.txt`) |
| `apps/portfolio` | The family office workspace, adapted from open-source portfolio software and built with Bun and Vite |
| `packages/tokens` | Design tokens: the only home for colours, fonts and spacing |
| `assets/` | Landing imagery, favicons and the sharing card image |
| `upstream/` | Origins and attribution for donor-derived foundations |
| `docs/` | Markdown documentation in numbered folders |
| `donor/contenders/` | Local contender clones, never committed |
| `ci/` | Build, preview and local verification scripts |

## Documentation

- [Identity](docs/00%20-%20Canonical/Identity.md) and [Smith Family Constitution](docs/00%20-%20Canonical/Smith%20Family%20-%20Constitution.md)
- [Architecture](docs/03%20-%20Architecture/Architecture.md), [Trace](docs/03%20-%20Architecture/Trace.md) and [Release - MVP](docs/03%20-%20Architecture/Release%20-%20MVP.md)
- [Design](docs/04%20-%20Design/Design.md) and [Landing imagery](docs/04%20-%20Design/Assets%20-%20Landing%20Imagery.md)
- [Pillars](docs/05%20-%20Requirements/Pillars.md), [Auth Flow](docs/05%20-%20Requirements/Auth%20Flow.md) and [MVP Feature Scope](docs/05%20-%20Requirements/Product%20Requirements%20-%20MVP%20Feature%20Scope.md)
- [Submission pack](docs/07%20-%20Submission/README.md), including the project sign-off report and demo script
- [Literature and references](docs/01%20-%20Notes/Literature%20-%20References.md)

Documentation is plain Markdown under `docs/`. There is no documentation site generator.

## Open source

FamilyBizness is built on open-source projects and stays in the open-source domain, so that other small family offices can fork it, contribute and scale it. It adapts code from Wealthfolio, Ghostfolio, ERPNext, Cal.diy and Dither Kit. Each keeps its own licence (AGPL, GPL and MIT); the [donor ledger](docs/03%20-%20Architecture/Donors%20-%20Frontend%20Contribution%20Ledger.md) and the in-app attribution manifest record what came from where.

Nothing here is legal, tax or investment advice. Estate structuring assumes English law as a baseline and must be confirmed with qualified advisers.

## Team

Kartavya Jharwal, Abdul Rafay Malik, Dalet Sandoval, Michael Stone and Sonia Vasnani.

## For coding agents

Read [`AGENTS.md`](AGENTS.md) (or [`CLAUDE.md`](CLAUDE.md)) before changing anything.
