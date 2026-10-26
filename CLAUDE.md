# FamilyBizness — Claude / coding-agent rules

Mirror of project rules for Claude Code and similar agents. Keep aligned with `AGENTS.md` and `.cursor/rules/`.

## Product (canonical)

See `docs/00 - Canonical/Identity.md` — do not redefine name, audience, form, or pillars elsewhere.

FamilyBizness is a wealth platform for an SFO: estate + family-business financial affairs, multi-generational returns. MVP / live URL. Audience: patriarchs, family board, CEO/MDs. English law baseline for estate structuring.

## Build posture

1. Start **minimal**. Scaffold around the product; do not build the full app.
2. Prefer **contender refactor path**: clone into `donot/contenders/` → static web UI → fit into this monorepo.
3. Never commit contender clones (`donot/` is gitignored aside from READMEs).
4. No full auth, portfolio engines, or financial models unless explicitly requested.
5. Docs = Markdown under `docs/` only (no mkdocs yet).

## Structure rules

- Numbered function folders: `01 - Notes/`, `02 - Strategy/`, `03 - Architecture/`, `04 - Design/`, `05 - Requirements/`, `06 - Operating Model/`, plus `00 - Canonical/`.
- One home per topic.
- Names: `Subject - Description.ext`, Title Case; date-prefix only when time-sensitive; no version suffixes.
- One-line README when a new folder’s purpose isn’t obvious.
- Trace + Architecture + Design.md stay load-bearing.
- Tokens: **only** `packages/tokens/tokens.css`.

## Release blockers

Poor contrast and overlapping chart labels block release. Render and verify visually before shipping UI.

## Cold visit (document / stubs)

Legacy → login → splash → verification. See `docs/05 - Requirements/Auth Flow.md`.

## Commands

```bash
bun install
bun run dev      # apps/web
bun run build    # → dist/
bun run preview  # serve dist/
```
