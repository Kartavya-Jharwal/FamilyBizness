# Donor conversion playbook (FamilyBizness)

Repeatable checklist: clone a contender into `donor/contenders/`, convert it to a **static demo UI shell** for GitHub Pages (Bun + Vite), keep full visual UI, AGPL + attribution, **no parent monorepo edits**.

Copy this file into each donor as `donor.plan.md`, fill placeholders, then execute.

## Placeholders

| Placeholder | Meaning |
|-------------|---------|
| `{{DONOR_NAME}}` | Contender folder / product name (upstream brand for attribution only) |
| `{{UPSTREAM_URL}}` | Exact clone/source URL |
| `{{FETCH_DATETIME}}` | Local fetch datetime stamped into NOTICE (ISO 8601 preferred) |
| `{{DONOR_DIR}}` | Path under `donor/contenders/{{DONOR_NAME}}` |
| `{{PRODUCT_STRING}}` | Upstream product string to scrub from **code** (e.g. `wealthfolio` / `Wealthfolio`) |
| `{{HARM_REVIEW_NOMINEE}}` | Named person or role who must pass harm review before publish/demo |

**Example fill (donor #1):** `{{DONOR_NAME}}` = Wealthfolio; see also `donor/contenders/Wealthfolio/donor.plan.md`.

---

## 1. Purpose

- **Pipeline:** contender clone → static demo UI shell → later GH Pages preview.
- **Stack:** Bun (install / scripts / serve) + Vite (bundler). Keep coexistence; do not replace Vite with another bundler.
- **UI:** Keep the **full visual** upstream UI. Demo sample data; browser-persisted mutations where cheap. Do not simplify visuals.
- **License:** Preserve AGPL (or upstream license) + attribution in `LICENSE` / `NOTICE.md` / `TRADEMARKS.md`.
- **Scope boundary:** Work only under `donor/`. Do **not** modify FamilyBizness parent `apps/` or `docs/` for the conversion itself.
- **Later (out of scope for this playbook body):** Frankenstein UI silos across 6–9 donors with shared tokens / cross-nav; replace faux AI with a stronger donor if one exists.

---

## 2. Decisions locked

Source of truth for these locks: Wealthfolio static UI shell plan (`static_ui_shell_*.plan.md`). Apply the same locks to every donor unless an explicit per-donor exception is written into that donor’s `donor.plan.md`.

| Decision | Rule |
|----------|------|
| Data | **Demo sample data**; cheap mutations via fixtures + `localStorage` |
| Delete natives | Docker, Tauri, Rust crates/server, packaging that assumes native runtime |
| Git | **Delete** `.git` / remotes after stamping provenance |
| NOTICE | Stamp `{{UPSTREAM_URL}}` + `{{FETCH_DATETIME}}` before detaching git |
| Brand string | `{{PRODUCT_STRING}}` / upstream product name **only** in `LICENSE`, `NOTICE.md`, `TRADEMARKS.md` |
| Code scrub | Remove upstream product name from identifiers, paths, package names, UI strings, i18n, CSS/localStorage keys, logo path segments |
| Parent | No FamilyBizness parent edits |
| Tooling | Bun + Vite coexist; `BUILD_TARGET=web` / static-only; GH Pages `base` |

---

## 3. Live integrations policy

| Area | Action |
|------|--------|
| Connect-like products (broker sync, deeplinks, provider keys, Connect settings) | **DELETE entirely** — no stubs, no “disabled” flags, no leftover Connect symbols |
| MCP / agent-access | **DELETE entirely** |
| Cloud backups | **DELETE entirely** |
| AI chat / assistant UI | **May stay as FAUX** (see below) unless another donor already owns AI better — then delete or stub minimally and note the owner donor |

### Faux AI (when kept)

1. User picks among **multiple hardcoded option prompts** (chips/buttons), not a free-form production agent.
2. On send: show a **delayed fake “reasoning” stream** (typed/chunked filler).
3. Then always surface a **hardcoded delightful technical error** (fixed copy), regardless of option or any free-text input.

No real model calls. No streaming to a backend. Faux copy must pass §10 harm review.

---

## 4. Delete list (paths / patterns)

Adapt names to the donor; delete when present.

**Native / backend**

- `apps/tauri/`, `apps/server/`, `crates/`
- Root Cargo files, `rust-toolchain.toml`, `clippy.toml`
- `packaging/`, Tauri scripts, server orchestration (`dev:web` that starts a backend)
- Docker / Compose / Dockerfiles
- Residual CI that assumes Rust/server (trim `.github` until a Pages workflow is added later)
- Server-bound e2e / addon sandbox / `addon-dev-tools` if only for live addons

**Live integrations**

- Entire Connect / broker-sync feature trees, routes, nav, adapters, env keys
- MCP / agent-access pages, adapters, types, tests
- Cloud backup pages, adapters, commands, tests

**Git**

- `.git/` (after §8 NOTICE stamp)

**Keep**

- Frontend app tree (minus deleted features), shared UI packages needed for visuals, AGPL + attribution docs

---

## 5. Static adapter + boot path

1. **Static adapter** (`adapters/static` or slimmed web): `invoke` → fixtures + `localStorage`; empty stubs only for leftover non-deleted commands pages still call.
2. **Boot:** remove AuthGate / NativeDatabaseGate / Connect (or equivalent) provider wiring; default **demo profile**; land on dashboard (or donor primary home).
3. Skip auth / DB / secret-store gates so the browser demo opens immediately.
4. Prefer fictional demo identities — never real people or real account numbers (see §10).

---

## 6. Bun + Vite coexistence

- Bun owns `install`, script entrypoints, local serve/preview, and Vitest where practical.
- Vite remains the bundler; clean config for **static-only** (no Tauri plugin / desktop hooks).
- Root scripts call Vite (`bun run build` → Vite build).
- Force web/static target (`BUILD_TARGET=web` or equivalent); set `base` for GH Pages.
- Drop Tauri / native runtime dependencies from `package.json` workspaces.

---

## 7. Trademark / proprietary scrub

- Upstream product name only in `LICENSE` / `NOTICE.md` / `TRADEMARKS.md`.
- Rename UI product strings toward FamilyBizness (or neutral demo labels) as needed for the silo.
- Purge `{{PRODUCT_STRING}}` from: feature folders, imports, package names (`@…`), i18n keys, CSS/localStorage keys, logo path segments.
- Logos: use placeholders / initials / avatars; drop ticker/brokerage logo packs if present.
- No Connect / updater / MCP secrets left in env examples.

---

## 8. Provenance without git

1. Create or update `NOTICE.md` with:
   - Upstream project name (attribution)
   - `{{UPSTREAM_URL}}`
   - **Exact** local fetch datetime: `{{FETCH_DATETIME}}`
2. Delete `.git` (and remotes). Do not re-init unless FamilyBizness process explicitly requires it later.
3. Contender trees under `donor/` stay **uncommitted** to the parent repo (except README / playbook pointers allowed under `donor/`).

---

## 9. Success criteria + verification

**Done when**

- [ ] `bun install` succeeds in `{{DONOR_DIR}}`
- [ ] `bun run build` produces a static `dist/` (or configured outDir)
- [ ] `bun run dev` / preview shows full visual UI with demo sample data
- [ ] No Rust, Tauri, Docker, Connect-like, MCP, or cloud-backup code remaining
- [ ] Grep of app/source **excluding** `LICENSE`, `NOTICE.md`, `TRADEMARKS.md`: **no** `{{PRODUCT_STRING}}` (case variants as needed)
- [ ] AI (if kept): option chips → delayed fake reasoning → hardcoded delightful technical error
- [ ] No `.git` in the donor tree
- [ ] §10 Harm Review Nominee signed **pass**

**Commands (run from `{{DONOR_DIR}}`)**

```bash
bun install
bun run build
# optional local check:
bun run preview
```

**Grep rules (adjust `{{PRODUCT_STRING}}`; exclude attribution files)**

```bash
# Fail if product string remains in code (example pattern — tune per donor)
rg -i '{{PRODUCT_STRING}}' --glob '!LICENSE*' --glob '!NOTICE.md' --glob '!TRADEMARKS.md' --glob '!donor.plan.md' --glob '!**/node_modules/**' --glob '!**/.git/**'
```

Also spot-check for leftover Connect / MCP / cloud-backup paths and `Cargo.toml` / `apps/tauri` / `apps/server`.

---

## 10. Nominee / harm review (mandatory gate)

**Role:** Harm Review Nominee — `{{HARM_REVIEW_NOMINEE}}`

Before **publishing or demoing** a donor static shell (GH Pages, shared preview URL, or external walkthrough), the nominee must review for **extreme personal harm** risks. Conversion engineering may proceed locally; **release/demo is blocked** until sign-off is **pass**.

### Checklist

- [ ] Fixtures / demo data: no real people, real account numbers, real tax IDs, or other PII that could enable financial doxxing
- [ ] No credential leaks (API keys, tokens, passwords) in repo, env examples, fixtures, or built assets
- [ ] Faux AI / hardcoded copy: no self-harm content, no abusive targeting, no instructions that enable serious harm
- [ ] No scraped real-world financial holdings presented as identifiable to living individuals
- [ ] Screenshots / sample media: no private documents or identifiable third parties without clearance
- [ ] Error / “delightful failure” copy is clearly fictional and not misleading as live advice from a regulated adviser

### Escalate / block (any one → **fail**, do not publish)

- Real PII or account identifiers in fixtures or UI
- Secrets in tree or `dist/`
- Self-harm, violent, or extreme abusive content in demo/AI copy
- Content that could enable harassment or financial doxxing of real persons
- Nominee unavailable: treat as **blocked** until a named nominee completes review

### Sign-off

| Field | Value |
|-------|-------|
| Donor | `{{DONOR_NAME}}` |
| Nominee | `{{HARM_REVIEW_NOMINEE}}` |
| Date | |
| Result | pass / fail |
| Notes | |

---

## 11. How to apply to the next donor

1. Clone upstream into `donor/contenders/{{DONOR_NAME}}` (local only; do not commit the clone to FamilyBizness).
2. Copy this playbook → `donor/contenders/{{DONOR_NAME}}/donor.plan.md`.
3. Fill all placeholders (`{{DONOR_NAME}}`, `{{UPSTREAM_URL}}`, `{{FETCH_DATETIME}}`, `{{PRODUCT_STRING}}`, `{{HARM_REVIEW_NOMINEE}}`, etc.).
4. Execute §§2–8 in order: delete natives/integrations → static adapter + boot → Bun+Vite → scrub → stamp NOTICE → detach git.
5. Verify with §9 commands and grep rules.
6. Complete §10 harm review; only then publish/demo.
7. Do not invent FamilyBizness product facts beyond the SFO donor pipeline; keep parent monorepo untouched.

---

## Later note

After several donors exist as static shells: unify tokens, add cross-nav / Frankenstein silos, and optionally replace faux AI with the strongest AI donor. That work is **not** part of each donor’s conversion checklist above.
