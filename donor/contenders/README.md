# Contenders — ingest workflow

Clone candidate apps here for review and refactor. Contents (except this README) are **gitignored**.

## How to add a contender

```bash
cd donor/contenders
git clone <repo-url> <short-name>
```

Example:

```bash
git clone https://github.com/example/wealth-dashboard.git wealth-dashboard
```

## Workflow

1. **Clone** into `donor/contenders/<name>/`.
2. **Explore** — map screens/modules to FamilyBizness pillars (`docs/05 - Requirements/Pillars.md`).
3. **Refactor toward static web UI** (HTML/CSS/JS or a static export) inside the clone or a branch you keep local.
4. **Fit** surviving pieces into `apps/web` (or a future app package), using `packages/tokens/tokens.css` and FamilyBizness navigation.
5. **Trace** constitution-linked parameters in `docs/03 - Architecture/Trace.md` when relevant.

Do not push contender code to the FamilyBizness remote. Promote only the integrated, owned result under `apps/` / `packages/` / `docs/`.
