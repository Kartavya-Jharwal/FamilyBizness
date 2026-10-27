# FamilyBizness — agent rules

Read [`docs/00 - Canonical/Identity.md`](docs/00%20-%20Canonical/Identity.md) before inventing product facts.

## What this is

Wealth management for an SFO: estate planning + family-business financial affairs across generations. Form: functional prototype / MVP on a live URL. Audience: patriarchs, family board, CEO/MDs.

## Do / don’t

- **Do** scaffold, document, and integrate via contender → static UI → fit into `apps/web`.
- **Don’t** vibe-code the full app from scratch. **Don’t** build real auth, portfolio engines, or financial models until asked.
- **Don’t** commit anything under `donor/` except the README placeholders. Contender clones stay local.

## Folder & naming

- Numbered, function-named folders (`01 - Notes/`, `02 - Strategy/`, …), most-used first.
- **One home per topic** — never two copies of the same fact or doc.
- File names: `Subject - Description.ext`, Title Case. Date-prefix only for time-sensitive docs. **No version numbers** (Git is history).
- New folder whose purpose isn’t obvious → one-line `README.md`.

## Canonical facts & tokens

- Load-bearing facts (identity, key names, headline numbers, definitions) live in **one** canonical file under `docs/00 - Canonical/`. Everywhere else **links**.
- Design tokens (colours, fonts, spacing) live in **`packages/tokens/tokens.css` only**. Never hardcode from memory.
- Keep Trace (`docs/03 - Architecture/Trace.md`), Architecture, and a reasonable Design.md current.

## UI quality (release blockers)

- Unreadable text (poor contrast) and overlapping chart labels are **release blockers**. Render, look/screenshot, verify before shipping.

## Docs

Markdown only under `docs/` for now — **not** mkdocs.

## Web preview

- `apps/web` → Bun static site → GitHub Pages (`dist/`).
- Brand-first hero; pillars after first viewport; cold-visit stubs only.

Aligned with `CLAUDE.md` and `.cursor/rules/`.
