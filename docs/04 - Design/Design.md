# Design

## Tokens (single file)

All colours, fonts, and spacing: [`../../packages/tokens/tokens.css`](../../packages/tokens/tokens.css).

Never hardcode values from memory in components or docs. Change the token file, then consume.

## Brand direction (preview shell)

- Deep sea-ink hero with mist / brass accents — not purple-on-white, not cream+terracotta+serif cliché.
- Display: **Syne**; body: **Karla** (loaded in `apps/web`).
- First viewport: brand as hero-level signal, one line, one CTA group — no cards, no dashboard clutter.

## Release blockers

Treat as ship-stoppers:

1. **Unreadable text** — poor contrast on any surface (hero or light pages).
2. **Overlapping chart labels** — when charts exist, render and screenshot-verify before merge.

Render, look, and verify contrast/labels before shipping UI.
