# Architecture

Product identity and legal baseline: [Identity](../00%20-%20Canonical/Identity.md). Release acceptance: [MVP matrix](../05%20-%20Requirements/Release%20-%20MVP%20Acceptance%20Matrix.md).

## Application and delivery

`apps/web` is the brand-first static entry and guide. `apps/portfolio` is the existing donor-derived React host for all functional workspaces. Bun packages both into root `dist/`, with Portfolio under `/portfolio/` and the configured project base path. GitHub Pages serves the static artifact. Donor servers, authentication providers and Git metadata are not runtime dependencies.

Visitor-profile selection for the prepared office lives inside Portfolio. Legacy login/splash/verification URLs redirect to that host. The main family workspace is the single KPI/action home; Family business, Portfolio, Calendar, constitution tools and stewardship reviews are working sections. The optional studio remains an advanced presentation, not another required dashboard.

## Family and constitution ownership

The prepared office uses one existing module store shared by visitor personas. `profile-workspace.ts` resolves office-persona IDs to that store; immutable session scope still belongs to the individual application load. Earlier independent profiles retain their own case storage and are available through secondary recovery entry.

The [combined operating charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md) owns selected provisions from all four documents. `family-office-constitution.ts` supplies the adopted pack and trace; `family-office-case.ts` reuses the existing validated GBP numerical scenario and imports the combined operational records once, transactionally. No new backend, accounting ledger or financial engine is introduced. Source changes invalidate dependent constitutional bindings.

The [office profile guide](../05%20-%20Requirements/Cases%20-%20Setup%20And%20Constitution%20Management.md) owns entry/maintenance behavior; [Trace](Trace.md) maps the selected topics to existing tools.

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

## Visual stewardship and local command boundary

Daily entry points render saved AUM/liquidity, DCF/multiple/sensitivity, portfolio allocation/projection and the calendar directly. Detailed editors mount on demand; source-record update events keep open visual summaries and editors synchronized. The host navigation is rendered once. Dedicated IPS and Family constitution routes own mandate adoption and charter review. The existing Wealthfolio Settings routes own office/profile, source, appearance and backup controls.

The static profile API dispatches to one local command engine, used by ProfileShell. It persists list/create/update/unlock/lock commands and admits the existing immutable session scope. Native/server transports are unchanged outside the static adapter. No profile HTTP request is needed for this build.

Prepared-office population now uses `stewardship-scenario.ts` to fill the existing book, historical statement records, dated AUM and investment/estate assumptions. The upgrade retains a local recovery snapshot before one-time replacement. Subsequent visits preserve saved edits. The numerical IPS statement is stored in the donated document workspace and activated in the existing typed rule owner; adoption updates source, document, mandate and rule snapshots transactionally.

The Wealthfolio visual pass reuses shared card components and exported card surfaces for daily financial workspaces. Composition CSS reads canonical dimensions and host semantic roles; calendar fields/sheets use existing field/overlay roles. The focused `scripts/verify-wealthfolio-art-direction.cjs` checks computed surface geometry and responsive light/dark rendering.

## Connected donor and brand integration

The public landing owns the family legacy narrative, founder/current/next-generation image slots, six tailored office capabilities and student/AI submission credits. Its single login CTA requests the existing profile chooser, including on a returning visit. Circular profile artwork is supplied through one image manifest and one renderer.

Calendar ports Cal DateValues, EmptyCell and EventList structures into the existing meeting register: mini-month/member rail, timed week, collision lanes, agenda and click-to-schedule. ERP ports Projects Workspace metadata, summary/list/board and project-to-Task drilldown over the same obligations. The contribution manifest records seven software sources including installed Dither Kit.

`please-fix-model.ts` reuses office-review actions and operations records. Admitted persona scope controls issue/assign/accept/resolve/reopen transitions; evidence and current clause fingerprints govern resolution. Generic ERP mutations cannot bypass the workflow. No parallel ticket database is introduced.

Dither Kit's installed local source supplies daily financial charts via `office-charts.tsx`; range bands retain their true floors and ceilings, and the median remains a line. Existing specialised Wealthfolio charts retain privacy, activity markers and axes while using the same installed painter for fill masks. Registry provenance/update guidance: [Dither Kit integration](Dither%20Kit%20-%20Source%20Integration.md).

## Root source ownership audit

| Root | Role in this integration |
|---|---|
| `apps/web`, `apps/portfolio` | Public family narrative and the adapted Wealthfolio application; both packaged by the root build |
| `packages`, `docs` | Canonical token primitives and product/source/architecture decisions |
| `.local-references/contenders`, `donor` | Inspected local upstream sources and intake placeholders; excluded from shipped source/runtime |
| `upstream` | Extracted provenance and registry fingerprints; not a second execution layer |
| `scripts`, `.github` | Bun packaging, source audits, focused checks and hosting workflow |
| `dist`, `artifacts` | Generated static product and local verification/handover evidence |
| `.git`, `.cache`, `node_modules`, `.cursor` | Repository/tool/dependency metadata, excluded from the static runtime |

The retired Portfolio contender remains a reference; active financial pages continue using the existing book, policy, optimiser and operations owners. No Cal provider runtime, Frappe backend, donor Git history or duplicate server is introduced.
