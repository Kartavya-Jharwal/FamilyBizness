# Ghostfolio - Integration Plan

Status: **local React integration implemented, 2026-10-27**. The retained workflows are adapted inside `apps/portfolio`; the standalone Ghostfolio and Wealthfolio contenders remain local reference sources. The user authorised implementation after the planning stage. Product identity stays in [Identity](../00%20-%20Canonical/Identity.md). Original licenses and source provenance remain distributed. No publication or Git merge was performed.

## Ownership and cuts

The comparison uses the existing `apps/portfolio/apps/frontend/src` implementation rather than assuming that a named page is absent.

| Capability | Evidence in Wealthfolio-derived app | Decision for Ghostfolio |
|---|---|---|
| Overview, holdings, accounts, activity entry/import and cash operations | `pages/dashboard`, `pages/holdings`, `pages/account`, `pages/activity` | Remove duplicate routes, editors, persistence and write endpoints. Keep fictional read models only where retained analytics need them. |
| Performance, benchmarks and top movers | `pages/performance`, `pages/insights/overview` | Wealthfolio owns the main performance workspace. Retain explanatory attribution and timeline panels as extraction candidates; remove the duplicate summary dashboard, benchmark picker and movers list. |
| Income and dividend management | `pages/income` | Remove the separate dividend timeline and its data flow. |
| Asset/sector/region/currency/account allocations | `pages/insights/overview/overview-page.tsx`, `portfolio-explorer.tsx`, `pages/allocation-targets` | Remove the general Allocations workspace. Retain a narrowly named ETF look-through view using the donor's existing top-holdings presentation. |
| Retirement planning | `features/goals/retirement-planner`, `features/goals/pages` | Remove the standalone FIRE calculator. Wealthfolio remains the candidate owner. |
| Assistant and general settings | `pages/ai-assistant`, `pages/settings` | Remove the second assistant and settings area. Retain only local analysis display/rule preferences. |
| X-ray investment-review rules | Existing `pages/health` addresses data health; it is not the same investment-review rule workflow | Retain the rule view and rule-preference interactions. Results remain explicitly fictional. |
| ETF constituent overlap and look-through | No equivalent constituent look-through screen found in the inspected frontend | Retain as a distinct candidate, including explicit sample-data coverage. This is a source-inspection finding, not a claim that the upstream product can never support it. |

## Architecture impact of this refactor

The standalone Ghostfolio donor remains a read-only reference. Its retained workflows have been adapted to React under `apps/portfolio/apps/frontend/src/pages/insights/analysis`. The host owns portfolio reads, account scope, performance period, formatting, balance privacy and theme. Only rule preferences are new persisted state, through the host's profile preference hook. No donor store, Angular runtime, copied portfolio fixtures, new network calls, rule evaluator or financial engine is included. Shared design values remain canonical in `packages/tokens/tokens.css` and are consumed through host semantic roles.

## Integration sequence

The contract below guided the local implementation. Provider-backed constituents, reconciled fee/flow attribution and real rule evaluation remain unavailable; they were not manufactured during the port.

1. **Freeze ownership and data contracts.** Wealthfolio's existing static adapters remain the sole source of account IDs, instrument IDs, values, performance series, currency and as-of dates. Map those existing records into read-only analysis inputs; do not copy its store or write to either donor's storage key. Keep return definitions, fees, cash inclusion, date windows and currency effects explicit; display unavailable fields instead of manufacturing values.
2. **Extract X-ray first.** Port the retained rule cards and controls to React and existing host UI components. Feed them from the host adapter through a small boundary. Preserve categories, enabled state, explanations and missing-data states. A real evaluation engine is a separate request; the current fixed illustrative report must not silently become investment advice.
3. **Port selected panels.** Place the useful attribution/timeline panels under the existing Performance/Insights workspace. Keep existing host charts as the default where they already cover the same task. Do not add a second Overview, Accounts, Activities, Holdings or Income navigation item.
4. **Add ETF look-through where data permits.** Map constituent identities and fund weights, aggregate the same underlying company across funds, show coverage and exclusions, and validate totals against host holdings. Preserve the current illustration until sufficient inputs exist; no live constituent provider is added implicitly.
5. **Unify navigation and appearance.** Use the host's route conventions, formatting, light/dark themes and canonical tokens. Port components deliberately rather than bundling Angular and React together. An iframe/microfrontend is a fallback only if a later decision explicitly chooses it; no iframe bridge is being built now.
6. **Preserve provenance on extraction.** Keep each upstream LICENSE unchanged and retain separate NOTICE/TRADEMARKS records for copied source and assets. Carry a visible neutral "Open-source attribution" entry with the wording "This is a modified fork of Ghostfolio" and the upstream link. That credit is attribution, not a product name, logo or endorsement.
7. **Validate before integration.** Test host-to-analysis mappings, one storage owner, missing data, consistent totals/units/date windows, rule preferences, deep links and source attribution. Render desktop/mobile and light/dark views. Publish only after the existing donor review gate is met.

## Design and token integration contract

The Wealthfolio-derived app supplies the destination shell, component behaviour and theme selection. Ghostfolio supplies selected analysis workflows and presentation ideas. Preserve useful information hierarchy, then express it through host components; do not copy Angular Material/Ionic markup, global Bootstrap styles or the standalone donor header into the host.

All shared values remain in [canonical tokens](../../packages/tokens/tokens.css). The host UI package already maps semantic roles in `apps/portfolio/packages/ui/src/styles.css`; extend that existing boundary where necessary instead of adding a parallel Ghostfolio theme. The donor's current token consumption is preparation, not completed host design integration.

| Concern | Planned destination mapping | Required review |
|---|---|---|
| Page/card/popover surfaces and text | Host `background`, `foreground`, `card`, `popover`, `muted-foreground`, border and focus-ring roles, resolved through the active theme | No literal donor colours or light-only styles; readable nested surfaces and overlays. |
| Typography, density and geometry | Canonical font/spacing/radius/control tokens through host utilities and components | Match host heading hierarchy, numeric alignment, row density and responsive breakpoints; preserve scanability of long explanations. |
| Rule cards and controls | Host cards, badges, menus, switches and disclosure patterns | Keyboard navigation, focus return, accessible names, disabled states and consistent hit targets. |
| Analysis and look-through tables | Host financial formatting and table/disclosure components | Currency, percentage, sign, precision and missing-value conventions match adjacent host screens. |
| Charts | Host chart conventions using canonical categorical and time-series palettes | Stable series identity across screens, explicit units, accessible legends, readable ticks and theme updates without stale canvas colours. |
| Rule status | Semantic success/warning/info roles plus text/icon labels | An unmet review criterion is distinct from a negative return, data error or destructive action. Disabled and unavailable rules do not look fulfilled. |
| Theme ownership | Existing host theme provider and selected theme | Retire donor `theme-light`/`theme-dark` selectors and standalone preference controls after extraction. Support host alternate themes through semantic roles, not forced Classic colours. |

Any missing role must first be named by purpose and added to the canonical token file, then bound at the host theme boundary. Do not duplicate primitive values in a component or retain obsolete donor CSS variables. Inventory the actual component styles during the port before declaring token coverage complete.

## Semantic and structural reconciliation

The inspected host types in `apps/portfolio/apps/frontend/src/lib/types.ts` distinguish account/instrument holdings, monetary values, return methods, attribution and data quality. The donor's simplified read model is not an interchangeable schema. Use an explicit, read-only adapter with documented units and provenance; do not rename fields until they appear compatible.

| Difference | Planned reconciliation |
|---|---|
| Navigation and page structure | Put investment review and look-through within the existing Insights structure, with explanatory return panels in Performance/Insights as appropriate. Final labels/routes require a host navigation review. Keep host Data Health distinct from investment-review X-ray. Do not transplant the donor's four-tab shell. |
| Holding identity and aggregation | Start from host account/instrument IDs, lifecycle state and source account IDs. Define whether the analysis scope is an account or aggregate portfolio; aggregate the same instrument once per intended scope. Never join by display label alone. |
| Asset taxonomy | Map donor asset class/subclass concepts to host instrument/asset-kind classifications explicitly. Keep unmapped classifications visible as unknown; do not silently turn them into equity or exclude them from totals. |
| Money and valuation time | Honour host local/base currencies, FX availability, monetary-value structure and `asOfDate`. Show stale/missing inputs. The donor's GBP-only fixture cannot determine host currency semantics. |
| Returns and contribution history | Host `PerformanceResult` carries scope, period, method, returns, attribution, basis and quality. Donor net performance is not automatically host total gain, total return, TWR or IRR. Map only equivalent definitions; preserve annualized versus period returns, fees/taxes, income, FX and cash-flow treatment. An investment timeline must define gross buys versus external net contributions before receiving host data. |
| Ratios and percentages | Record whether each source uses a fraction, percentage points or an amount, and normalize exactly once. Preserve denominator and cash inclusion. Confirm conventions from producers/formatters, not field names. |
| Rule meaning and state | Separate enabled/disabled, fulfilled/unfulfilled and unavailable/not evaluated. Preserve criterion, threshold, scope and evidence; report coverage alongside counts. Current fixed fictional outcomes must stay labelled until a separately authorised evaluator exists. |
| Data quality | Carry host `ok`, `partial`, `noData`, `notApplicable` and basis-status distinctions into view states. Missing fees, classifications or cost basis are not zero values or successful checks. |
| ETF look-through | Distinguish position weight, constituent weight within a fund, exposure amount and share of covered exposure. Show constituent as-of dates and coverage; define direct-holding inclusion to avoid double counting. Unsupported instruments remain visible in exclusions. |
| State and interaction | Host scope/date filters, settings and route state own the integrated views. Read-only drill-down may navigate to existing holding pages; it must not resurrect donor editors, duplicate stores or write endpoints. Map donor rule IDs explicitly if preferences are ever migrated. |

### Gate before implementation of the merge

1. Produce a field-level adapter table from actual host producers and formatters, including identity, units, dates, denominator, return method, nullability and quality. Resolve mismatches or mark the affected panel unavailable.
2. Review representative host-style layouts for X-ray, look-through and a selected chart, including loading, empty, partial, disabled and error states. Confirm navigation and terminology before porting the remaining views.
3. Validate semantic fixtures: multi-account duplicates, mixed currencies, missing cost basis/fees, partial constituent coverage, disabled rules and mismatched valuation dates. Reconcile equivalent totals against the host, not donor fixture totals.
4. Verify canonical token consumption, active host themes, desktop/mobile layouts, keyboard interactions, long labels and chart contrast. No unreadable text or overlapping labels may pass.
5. Carry attribution with extracted source and retain explicit fork wording. Remove the standalone donor shell only after host navigation and attribution are verified.

These gates distinguish the implemented UI/data boundary from future provider or evaluation work. The local implementation uses unavailable states where the host contract has no compatible inputs.

## Implemented host mapping

| Input / state | Source and semantics | Host presentation |
|---|---|---|
| Account scope | `useAccountScopeStore` and `useHoldings`; same selector as Insights | X-ray and look-through change with host accounts/portfolios. No second scope store. |
| Position value | `Holding.marketValue.base`, only when `baseCurrency` matches the host setting; `asOfDate` retained | Readable-value total includes cash. Missing/negative/mismatched-currency and overlapping aggregate/account records are excluded with reasons. Duplicate exact records count once. |
| Instrument identity | `instrument.id` plus account/holding IDs; `sourceAccountIds` identifies aggregate overlap | Multiple legitimate accounts may hold the same fund. Names are never join keys. |
| Fund eligibility | Explicit `instrumentType` fund/ETF classifications; cash and known private-equity holdings excluded | Label is Fund look-through because the host sample uses generic funds, not verified ETF classifications. No equity classification is inferred from a fund name. |
| Constituents | No host feed currently exists | Current view shows zero coverage, fund exclusions and no fabricated companies. The adapter and disclosure component support explicit constituent IDs, fractional weights and matching dates; partial lists retain unrepresented value. |
| Review outcomes | No reconciled evaluator or thresholds supplied | Enabled/disabled preference is independent of not evaluated. There is no invented pass/fail score. The donor's fixed sample outcomes are not attached to host holdings. |
| Return detail | `calculatePerformanceHistory` with explicit host scope and Performance dates; `PerformanceResult.mode`, summary status/method, period and quality retained | Value return remains value return. A mismatched summary method, missing breakdown component or incompatible currency does not become TWR, zero or a new calculation. |
| Percentages | Host performance summaries and constituent inputs use fractions; host formatter multiplies for display | Formatting happens once. Fund weight, represented-company share and fund-value coverage have distinct denominators. |
| Evolution | `getHistoricalValuations`; compatible complete `TOTAL` rows, unique by date | Recharts line in the host series palette, compact axes, accessible value table and explicit source dates. It is historical total value, not contribution history. |
| Investment timeline | No reconciled external-flow series is supplied to this feature | Explicit unavailable state. Cost basis and purchases are not relabelled as contributions. |
| Period and settings | Existing Performance date preference and dashboard period mapping; host timezone and formatting providers | Return detail follows Performance and links there to change the period. No donor date/theme settings or migration of donor local storage. |
| Design and accessibility | Host cards, badges, switches, tabs, typography, semantic colours and series roles | Classic light/dark and Signature light reviewed. Inactive mobile swipe panels are inert and hidden from the accessibility tree. Balance privacy suppresses amounts and the chart. |
| Attribution | `public/open-source/ghostfolio` copied by Vite into the artifact | Visible `/open-source` route says "This is a modified fork of Ghostfolio", links upstream and distributes original license, provenance and trademark notices. Product navigation has no Ghostfolio branding. |

## Verification and remaining limits

- Focused suite: **15 tests pass**, covering semantic mapping, host account scope, duplicate/aggregate exclusion, currencies, missing attribution, rule state, constituent aggregation/coverage/dates, loading/error/empty states and balance privacy.
- Host production build passes. The parent static build also packages the integrated portfolio and public legal records; its existing dependency/chunk warnings remain separate from this feature.
- The initial host type-check stopped at a native-app type reference. The subsequent combined editing pass points source resolution at the web adapter; inherited native/removed-feature references and unbuilt workspace declarations still prevent a clean full-project check. The current gate and diagnostic limits are recorded in [Donor - Combined Pass Sign-Off](Donor%20-%20Combined%20Pass%20Sign-Off.md).
- Browser review confirms account switching, preference persistence after reload, mobile navigation, visible fork attribution and readable desktop/mobile charts. No horizontal overflow at 390 px. Evidence is under `apps/portfolio/artifacts/analysis/`.
- Current host fixtures remain fictional. Investment-review evaluation, constituent providers, fee/tax/FX attribution and contribution-flow reconciliation remain future work. No external deployment was attempted.

## Acceptance for the current local reduction

- X-ray, selected analysis panels, ETF look-through and attribution remain reachable.
- Duplicate core-workflow routes and write APIs are absent; no hidden editor trees remain bundled.
- Existing donor charts/components are reused where retained, with dead code and packages pruned.
- Analysis preferences do not overwrite legacy sample accounts or another donor's state.
- Attribution visibly says that this is a modified fork of Ghostfolio; the upstream name is absent from product branding, logos, package names and ordinary application identifiers.
- Build, focused regression tests, source audit and visual review pass.
- The initial reduction did not modify the host. The later authorised React extraction is recorded above; no deployment or Git merge occurred.
