# Architecture

Product identity and legal baseline: [Identity](../00%20-%20Canonical/Identity.md). Release acceptance: [MVP matrix](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md).

## Application and delivery

`apps/web` is the brand-first static entry and guide. `apps/portfolio` is the existing donor-derived React host for all functional workspaces. Bun packages both into root `dist/`, with Portfolio under `/portfolio/` and the configured project base path. GitHub Pages serves the static artifact. Donor servers, authentication providers and Git metadata are not runtime dependencies.

Entry/profile selection and case setup live inside Portfolio. Legacy login/splash/verification URLs redirect to that host. The main family workspace is the single KPI/action home; Family business, Portfolio, Calendar, constitution tools and stewardship reviews are working sections. The optional studio remains an advanced presentation, not another required dashboard.

## Family and constitution ownership

Browser profiles own independent case records. A family can start blank or copy a teaching template. Golden Bird is an optional sample, not the final family/business/constitution of the platform. Constitution packs, sources, adopted parameters, active selection and generic policy revisions remain scoped to the selected profile. Source changes invalidate dependent constitutional bindings.

The [case setup guide](../05%20-%20Requirements/Cases%20-%20Setup%20And%20Constitution%20Management.md) owns the setup/constitution lifecycle; [Trace](Trace.md) maps source topics to consuming tools. Original supplied Golden Bird material is retained as internal provenance alongside its selected fictional English-law/GBP adaptation.

## Saved data boundaries

The financial book owns entity statements, opening cash/equity, FX, matched eliminations, business valuation and monthly budgets. Family fair-value wealth uses a non-overlapping owner perimeter and replaces the business carrying asset with DCF equity once. Restricted funds and unavailable illiquid resources are not spendable family cash.

Governance owns people, ownership/control, RACI, approvals, succession snapshots and continuity evidence. Operations owns tasks and meetings; the calendar and ERP-derived task frontend read that same register. Review scoring and source-display states are metadata, not a competing task or accounting ledger. A **please fix** action enters the existing operations queue.

The estate owner retains legal/beneficial asset assumptions, dated scoped IHT inputs, gift history, separate trust lifecycle and succession funding. Structure comparisons use the same opening economic inputs and existing tax engine. Portfolio construction/performance owners retain security constraints/correlations, observed periods and reproducible scenario inputs. Cash-distribution adoption updates the financial forecast and saved spending scenario through the existing transactional case-import boundary.

Portable case packs validate included modules before writing and roll back on failure. Board reports compose saved owners, not unpersisted on-screen defaults. Missing/invalid/unsupported inputs remain visible.

## Frontend donors and tokens

The [contribution ledger](Donors%20-%20Frontend%20Contribution%20Ledger.md) identifies actual transferred frontend files/masks/code and their provenance, distinct from design references. Donor-specific backend calls are replaced by existing host reads and local callbacks. Original licenses and notices are distributed.

`packages/tokens/tokens.css` is the shared visual authority. Portfolio semantic components/theme roles take precedence over donor styling. Public entry fonts are bundled locally. No duplicate token palette or new application shell is introduced.

## Product boundary

This is the deliberately browser-local functional MVP. It does not execute financial/legal transactions or implement production authentication, live service synchronization, delivery of invitations/messages or a shared server database. These excluded services are not outstanding donor-integration tasks. User-authored cases can be exported for retention and transfer.

Detailed routes, supported calculations and release verification: [Integration](Integration%20-%20Family%20Office%20Workspaces.md).
