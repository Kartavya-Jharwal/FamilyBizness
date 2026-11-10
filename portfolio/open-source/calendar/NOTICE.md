# Calendar Frontend Adaptation

Source: Cal.diy, https://github.com/calcom/cal.diy, commit `91eefbf9f460bac7d69327fea4d9560295390e0a`.

Copyright (c) 2020-present Cal.com, Inc. MIT. The original license is distributed as `LICENSE`.

## Extracted frontend

`src/features/family-office/cal-calendar-frontend.tsx` adapts the JSX structure and state bindings of:

- `apps/web/modules/calendars/weeklyview/components/heading/SchedulerHeading.tsx`: date-range header and previous/next grouped controls.
- `apps/web/modules/calendars/weeklyview/components/Calendar.tsx` and `event/EventList.tsx`: seven-day column iteration, per-day event lists and stable event selection attributes.
- `packages/ui/components/calendar-switch/CalendarSwitch.tsx`: labelled child-control row.
- `packages/features/calendars/weeklyview/utils/overlap.ts`: start/end ordering and sweep-based overlap grouping.

`operations-model.ts` also retains the inclusive-start/exclusive-end week-range adaptation from `apps/web/modules/bookings/components/BookingCalendarView.tsx`.

Changes: host-owned props replace the Cal store, dayjs and booking objects. Portfolio components, semantic theme roles and canonical tokens replace Cal global styles. The transplanted Calendar composition now includes DateValues day headers, HorizontalLines/hour labels, EmptyCell half-hour creation and EventList timed positioning. The compact DatePicker/member rail uses host DayPicker semantics. The overlap sweep assigns separate lanes instead of the donor cascade, and hover/focus reveals the complete event card. Agenda remains a grouped date list. Collision warnings compare meetings on the same date in the same recorded IANA zone; cross-zone conversion is not asserted. All-day task deadlines remain date-only. Local recurrence retains each occurrence's details and evidence.

No Next/Frappe server, provider integration, credential store, donor Git directory, booking payment actions or external invitation dispatch is distributed. No affiliation or endorsement is claimed. Source SHA-256 fingerprints and host paths are in `../donor-manifest.json`.

Additional source structures: `DateValues/index.tsx`, `horizontalLines/index.tsx`, `event/Empty.tsx`, and `packages/features/calendars/components/DatePicker.tsx`. Empty-cell selection passes date and wall time into the existing operations editor; the one operations register persists the saved meeting. There is no booking-provider connection.
