# Wealthfolio — Contender Plan

Recovered from Cursor logs (2026-10-26/27). Canonical product facts → [`../00 - Canonical/Identity.md`](../00%20-%20Canonical/Identity.md). Pillars → [`../05 - Requirements/Pillars.md`](../05%20-%20Requirements/Pillars.md). Contender path → [`../03 - Architecture/Architecture.md`](../03%20-%20Architecture/Architecture.md).

## What the plan actually was

Wealthfolio is **donor #1 of ~6–9**, not a greenfield FamilyBizness rebuild. Convert the clone into a **full-fidelity static demo UI shell** (Bun + Vite → GitHub Pages), keep the visual UX and TS logic, drop native/backend/live integrations, then later Frankenstein multiple donor silos with shared tokens / cross-nav.

Source artefacts (local / gitignored — not in this repo):

| Artefact | Role |
|----------|------|
| Cursor plan `static_ui_shell_c221db79.plan.md` | Locked decisions + todos for Wealthfolio conversion |
| `donor/Donor.plan.md` | Repeatable playbook for every future donor |
| `donor/contenders/Wealthfolio/donor.plan.md` | Per-silo copy (still mostly unfilled placeholders) |

Transcripts: [Wealthfolio static shell](529fa136-84fb-4e4b-9297-addc8af23e92) · [Donor playbook write](5a0e4268-3206-49dc-96ab-047eeb30d962) · [FamilyBizness setup](25cfcb2d-e0de-494e-916c-5fef0fd6e9fe) · [Parent chat](c26de1d5-2f8b-4ec7-95d8-fbf767d7398e).

## Decisions locked (from the Wealthfolio plan)

1. **Pipeline:** clone → static demo shell → (later) Pages / Frankenstein into parent navigation.
2. **Do not touch** FamilyBizness parent `apps/` / product docs during the conversion itself.
3. **Keep** full visual UI + demo fixtures / `localStorage` mutations; do not simplify visuals.
4. **Delete:** Tauri, Rust/server, Docker, `.git` (after NOTICE stamp), Connect, MCP/agent-access, cloud backups — no stubs for Connect/MCP/cloud.
5. **Scrub** “Wealthfolio” from application code; keep the name only in `LICENSE` / `NOTICE.md` / `TRADEMARKS.md`.
6. **Tooling:** Bun + Vite coexist; static-only / `BUILD_TARGET=web`.
7. **AI:** keep UI as **faux** demo (option chips → delayed fake reasoning → hardcoded delightful technical error) until a stronger AI donor replaces it.
8. **Harm review:** nominee sign-off before publish/demo (`{{HARM_REVIEW_NOMINEE}}` in the playbook).

## Relation to the 6 SFO pillars

**No transcript wrote a Wealthfolio-feature → pillar matrix.** Closest related decisions:

| Layer | What was planned |
|-------|------------------|
| Parent monorepo ([setup](25cfcb2d-e0de-494e-916c-5fef0fd6e9fe)) | Document all 6 pillars; scaffold nav stubs only in `apps/web`; full modules via contender → static → integrate |
| Wealthfolio donor | Portfolio / personal-finance UI shell → natural fit for **Pillar 4 (Portfolio selection & optimisation)** and demo surface for **Pillar 5 (Financial modelling & analytics)**; not a governance/constitution/estate/ops donor |
| Later | 6–9 donors as isolated silos → shared tokens / cross-nav (“Frankenstein”); that step maps silos onto pillars |

Do not invent a detailed pillar map beyond that until a donor is explicitly assigned per pillar.

## Planned vs done (snapshot)

| Step | Status |
|------|--------|
| Clone Wealthfolio into ingest tree | Done (`donor/contenders/Wealthfolio`) |
| Strip Docker / trademarks; keep AGPL + NOTICE | Done early |
| Cursor “Static UI shell” plan + implement todos | Partially done — Connect/MCP/cloud delete, code scrub, static adapter, faux AI largely done; Cursor plan file still shows some todos pending/in_progress |
| Detach `.git` + NOTICE fetch stamp | Appears done on disk under `donor/contenders/Wealthfolio` |
| Delete Tauri / server / crates | Appears done on disk |
| Bun + Vite static scripts (`dev` / `build` / `preview`) | Present in donor `package.json` |
| Fill Wealthfolio-specific placeholders in `donor.plan.md` | **Not done** (template copy only) |
| Harm-review nominee pass | **Not done** |
| Verify demo (`bun run build` / preview green) | In progress / incomplete in plan todos |
| Integrate static UI into parent `apps/web` under pillars | **Not started** (explicitly out of scope for the donor conversion plan) |
| Commit playbook into parent `docs/` | This file (recovery) |

## Ingest path naming

Canonical ingest folder is **`donor/`** (not `donot/`). Contender clones live under `donor/contenders/`.

## Preview (donor silo, not parent)

From `donor/contenders/Wealthfolio` (after `bun install`):

```bash
bun run dev
bun run build
bun run preview
```

## Missing next

1. Finish / verify Wealthfolio static demo (build + preview; scrub grep; no Connect/MCP leftovers).
2. Fill `donor/contenders/Wealthfolio/donor.plan.md` placeholders (name, upstream URL, fetch datetime, product string, harm nominee).
3. Complete harm-review sign-off before any public demo URL.
4. Map surviving screens into `apps/web` pillar navigation (start with Pillars 4–5).
5. Clone next donors using `donor/Donor.plan.md`.
