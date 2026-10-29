# Calendar - Donor Intake And Integration Plan

Status: local source donor captured and inspected, 28 October 2026. No host calendar feature is implemented by this intake. Product facts remain in [Identity](../00%20-%20Canonical/Identity.md).

## Source and setup

| Field | Recorded value |
|---|---|
| Donor | Cal.diy, community scheduling application derived from Cal.com |
| Source | `https://github.com/calcom/cal.diy` |
| Local folder | `donor/contenders/cal-diy` |
| Captured commit | `91eefbf9f460bac7d69327fea4d9560295390e0a` |
| Source commit timestamp | `2026-10-28T21:26:54+05:30` |
| Capture completed before | `2026-10-28 23:44:28 UTC` |
| Capture form | Shallow Git clone; original source and Git metadata retained for inspection |
| Root license | MIT; original copyright notice names Cal.com, Inc. |
| Install/runtime status | Not installed or started; no credentials, database, email or calendar provider configured |

The parent repository ignores this donor folder. Keep the clone local and preserve original source and license records. When selected files are adapted, record their paths and exact commit, retain the MIT notice, and distribute any applicable dependency/asset notices. Cloning the source does not establish a working calendar integration or a deployable static app.

## Intended contribution

The user selected Cal.diy as the donor for the **obligations calendar** in the family-office operating model. Its useful contribution is scheduling presentation and interaction: a chronological view, calendar/list switching, date and timezone navigation, event detail inspection, recurrence presentation and editing patterns. Family-office obligations need substantially different semantics from public appointment booking.

The target module should answer: what is due, who is responsible, which entity or family member it concerns, what source created the obligation, and what needs attention next. It should link to the portfolio, constitution, succession scenario or financial record that explains the item. It should consume those owners' records rather than create another financial ledger or automatically interpret policy text as a legally binding deadline.

## Inspected stack and extraction implications

The source is a Yarn/Turborepo TypeScript monorepo. The web application uses React and Next.js, with tRPC, Prisma/PostgreSQL, authentication and server routes, provider integrations, and shared UI/date packages. It is not a Bun static application as cloned. The source README also states that enterprise teams, organizations, insights, workflows and SSO/SAML were removed from this community edition; do not assume a family responsibility or delegated-approval system is available because a similarly named Cal.com feature exists elsewhere.

The selected UI must be extracted into the existing FamilyBizness React portfolio host. Keep host routing, profile/persona scope, theme, components and canonical tokens. Do not bring in a second Next server, Prisma database, authentication surface, public booking portal or calendar-provider credential store for the prototype.

## Source-to-product mapping

| Inspected source | Useful pattern | FamilyBizness treatment |
|---|---|---|
| `apps/web/modules/bookings/components/BookingCalendarView.tsx` | Week navigation, timezone-aware event mapping, ordered events, theme-sensitive event colours, selection opening detail state | Adapt as an obligations week view. Stable obligation IDs replace booking IDs. Colour/status must use host semantic tokens, with text labels. |
| `apps/web/modules/calendars/weeklyview/components/Calendar` and `packages/features/calendars/weeklyview` | Calendar grid and event presentation contracts | Inspect dependencies before extraction; preserve date/time behavior while removing provider and booking assumptions. |
| `apps/web/modules/bookings/components/BookingList.tsx` and `BookingListContainer.tsx` | Scannable event list and status-based navigation | Use an agenda/list view for due dates, overdue items, owners and entities; remove payment, attendee and booking-provider affordances. |
| `apps/web/modules/bookings/components/BookingDetailsSheet.tsx` | Event detail sheet, recurrence explanation, keyboard interaction and contextual actions | Rebuild with host sheet/dialog components and source links. Do not copy its tRPC booking mutations, meeting joins, payments, accept/reject or external-provider actions. |
| `apps/web/modules/availability/availability-view.tsx` and `availability/[schedule]/schedule-view.tsx` | Schedule forms and timezone selection | Reference for availability or meeting windows only. Availability is distinct from a statutory deadline, all-day obligation or succession event. |
| `packages/features/timezone`, `schedules`, `holidays` and `packages/dayjs` | Date/time and recurrence concepts | Reuse only after dependency and behavior review. Do not infer legal holiday or filing deadline rules from generic scheduling utilities. |
| `packages/ui/components/calendar-switch`, `sheet`, `badge`, `table` | Established interaction patterns | Express through existing FamilyBizness UI and `packages/tokens/tokens.css`; do not create a parallel design system. |

## Proposed static fixture slice

The first slice should live inside the existing portfolio app and demonstrate an **Obligations** workspace with week and agenda views, a shared date range, owner/persona and entity filters, and an accessible detail panel. A detail should show an obligation's title, due date/time or all-day date, owner, entity, category, status, source reference, recurrence description and local notes. Links back to a constitution clause, financial-source record or scenario event should be explicit.

Use a small fictional fixture set: a quarterly family-board meeting; an annual constitution review; an accountant-supplied reporting deadline; an IPS review prompted by a sample exception; and a succession-scenario liquidity review. Dates and responsibilities are illustrative, not automatic legal calculations. Mark each fixture's source as sample data. A scenario event must stay a scenario and must not silently appear as a real scheduled event.

Local interactions can include selecting an event, filtering, changing the viewed week, adding a manual draft reminder, and marking a fixture complete in browser storage. Manual reminders are operational records, not financial entries. A reset must affect only this module's sample state. Persona filtering is a prototype view and must not be presented as access control.

Connector buttons for external calendars can show a truthful unconnected/sample state. No consent flow, secret entry, email dispatch, background notification, external booking or provider write is part of donor setup. Accounting and trading sources continue to own their financial records; a linked calendar item does not update a ledger.

## Tailoring and gaps

| Requirement | Gap to resolve |
|---|---|
| Obligations rather than appointments | Define due/overdue/completed/cancelled semantics, all-day dates, deadlines without duration, and evidence of completion. A booking confirmation is not obligation completion. |
| Responsibility and persona views | Introduce explicit owner IDs and entity links supplied by the family/ownership model. Source README's removed enterprise capabilities cannot supply this automatically. |
| Recurrence | Define timezone, daylight-saving behavior, series edits and exceptions. Keep accounting/legal deadline computation outside this generic calendar slice. |
| Source-linked obligations | Establish typed references to constitution revision/clause, source financial record and scenario event; preserve the original source timestamp and provenance. |
| IPS and warning priority | Consume a separately owned warning/IPS finding and link to its evidence. Do not invent severity, FMEA/RPN scoring or policy conclusions in the calendar. |
| Notifications and delegated work | Local notes and completion state do not send assignments or prove acknowledgement. Real delivery, permissions and audit events require a later service boundary. |
| Styling and navigation | Replace donor product marks and global styles in adapted UI; keep upstream attribution in legal records. Support host light/dark themes, mobile widths and keyboard use. |

## Integration acceptance

- Selected source files and their licenses are recorded before adaptation; the original local donor remains recoverable.
- Calendar and agenda use the same obligation IDs, filters and dates; timezone changes do not move all-day due dates accidentally.
- Empty, overdue, completed, recurring and scenario-only states are distinguishable without colour alone.
- Detail links retain source identity and revision; unsupported or deleted source references are visible.
- Prototype filters do not imply authorization; connector UI does not imply active synchronization or sent reminders.
- No server, provider SDK, credential, email or financial mutation is introduced by the static slice.
- Desktop/mobile, light/dark, long titles, overlapping events and keyboard/focus behavior are rendered and inspected before shipping.

## Intake result

The clone completed successfully and the root license, repository commit, package scripts and relevant scheduling surfaces were inspected. No dependencies were installed, no build or runtime test was claimed, and no host app source was changed. The donor is ready for a separately scoped static extraction and family-office tailoring pass.
