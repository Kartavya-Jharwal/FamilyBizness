# Donor Frontend Contribution Ledger

This ledger answers which source actually reached the shipped frontend. Product identity is in [Identity](../00%20-%20Canonical/Identity.md); release acceptance is maintained separately. The machine-readable [donor manifest](../../apps/portfolio/apps/frontend/public/open-source/donor-manifest.json) owns captured source revisions, per-file SHA-256 fingerprints, host paths and distributed license identifiers. It is copied into the static application and linked from attribution.

## Contribution audit

| Donor | Actual code and UI contribution | User-visible home | Removed boundary |
|---|---|---|---|
| Wealthfolio | Adapted application/frontend fork: shell, shared UI, portfolio/account/holding/activity and insights workflows, profile/theme foundations. Classic roles map to canonical tokens. | Portfolio and host navigation/settings | Upstream backend, authenticated service dependence, original product branding and duplicate donor runtime |
| Ghostfolio | Selected X-ray review/workflow, analysis/timeline presentation and look-through aggregation adapted from its local frontend fork into host React views. Host read adapters supply actual portfolio scope; unavailable constituents remain unavailable. | Insights X-ray, attribution/history, fund exposure | Angular runtime, second dashboard, second portfolio ledger, fixed review-success fixtures |
| Policy module | Supplied parser/NLP/assumptions-contract code is extracted. Its constitution-source/inspector layout is adapted in the existing host workspace. | Constitution drafting, source inspector, local IPS review | Separate Next shell, editor palette/fonts, external policy-engine runtime, fake binary import |
| ERPNext | Selected Task and Shareholder DocType field masks are extracted into runtime-consumed constants. Task list status/default filter, selected-item state actions and project/assignee/progress inspection are adapted from donor JavaScript. Task priority/progress/project/start fields persist in the existing operations record; shareholder mask drives owner/company filters and the estate holding register. | Family business operations and estate ownership register | Frappe/Python, server calls, permissions/naming series, accounting ledger and donor CSS |
| Cal.diy | SchedulerHeading, Calendar/EventList and CalendarSwitch frontend structures are ported to controlled host props; overlap sweep code is extracted. Week and agenda share one record set; overlapping same-zone meetings are identified without overlapping cards. | Family calendar | Cal stores, Next runtime, provider credentials, public booking/payment portal and donor CSS |
| Local simulation lab | Seeded process models plus GBM/OU input/result masks, model switch, charts, terminal summary and accessible table adapted to host React/Recharts. | Collapsed Stochastic process lab in Portfolio scenarios | Independent DOM application, uPlot/global theme and separate page/dashboard |

## What changed in this audit

The prior ERPNext integration was independently authored UI informed by a reference, rather than a direct source-code extraction. Earlier calendar reuse was limited to ordering/range behavior. Those are now extended by the actual runtime-consumed field masks, Task list behavior, calendar component structure and overlap code above. The ledger does not relabel the earlier patterns-only work as copied source.

The policy parser is an actual code donation, while its inspector is a host rendering of the donated workflow rather than a copied Next editor. The simulation donor's original uPlot implementation is intentionally not distributed: its control/result contract and pure models are retained with host chart rendering. Keeping Portfolio's own primitives and tokens takes precedence over preserving donor-specific rendering libraries.

## Single host and source trace

All current software donors are listed in the manifest. `Portfolio-retired` is a recoverable retired alternative, not an additional active donor or another application to ship. Golden Bird, Calcot / Stone, Sandoval and Vasnani are constitution/data sources for the [combined operating charter](../00%20-%20Canonical/Family%20Office%20-%20Combined%20Operating%20Charter.md), not additional software donors or four consolidated businesses.

The distributed product needs no donor clone or Git metadata. Original snapshots remain ignored under `.local-references/contenders`; selected adapted files and required notices/licenses are in normal host source/public paths. Runtime field metadata and algorithms are checked into host source, so CI never downloads a donor or executes its server to build the MVP. Copied ERPNext metadata/code retains its GPL notice and unchanged license; Cal.diy retains MIT; existing application/analysis notices retain their AGPL terms.

## Verification

Focused donor frontend/operations/meetings tests cover Task metadata round-trip and rejection, selected-item completion evidence, overlap grouping (including touching meetings and different-zone non-comparison), and existing calendar invariants. The parent release gate owns the combined type/build, full smoke and desktop/mobile visual inspection. Runtime donor components expose no provider transport or credential entry and do not create a second persistence layer.
