/**
 * Adapted from Cal.diy SchedulerHeading.tsx, Calendar.tsx, EventList.tsx,
 * CalendarSwitch.tsx and overlap.ts at 91eefbf9f460bac7d69327fea4d9560295390e0a.
 * Copyright (c) 2020-present Cal.com, Inc. MIT; see distributed calendar/LICENSE.
 * The host owns state, components, semantics and tokens; no Cal store/provider is loaded.
 */
import { useMemo, type ReactNode } from "react";
import { Button } from "@fb/ui";
import { dateOnly, monday, shiftDate, type Obligation } from "./operations-model";

interface TimedEvent { id: string; start: number; end: number }

/** Donor overlap sweep, converted from dayjs to numeric local-zone minute positions. */
export function buildOverlapGroups(events: TimedEvent[]): TimedEvent[][] {
  const sortedEvents = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  if (sortedEvents.length === 0) return [];
  const groups: TimedEvent[][] = [];
  let currentGroup: TimedEvent[] = [sortedEvents[0]];
  let currentGroupEnd = sortedEvents[0].end;
  for (let i = 1; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    if (event.start < currentGroupEnd) {
      currentGroup.push(event);
      if (event.end > currentGroupEnd) currentGroupEnd = event.end;
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      currentGroupEnd = event.end;
    }
  }
  groups.push(currentGroup);
  return groups;
}

/** Only compare recorded wall times within the same IANA zone. */
export function meetingConflictIds(rows: Obligation[]) {
  const byZone = new Map<string, TimedEvent[]>();
  for (const row of rows) {
    if (!row.meeting || row.status === "Cancelled") continue;
    const key = `${row.due}:${row.meeting.timeZone}`;
    const minutes = (time: string) => { const [hours, minute] = time.split(":").map(Number); return hours * 60 + minute; };
    byZone.set(key, [...(byZone.get(key) ?? []), { id: row.id, start: minutes(row.meeting.start), end: minutes(row.meeting.end) }]);
  }
  return new Set([...byZone.values()].flatMap(events => buildOverlapGroups(events).filter(group => group.length > 1).flatMap(group => group.map(event => event.id))));
}

/** SchedulerHeading's date header and previous/next controls, ported to host state. */
export function CalCalendarToolbar({ week, view, onWeekChange, onViewChange }: {
  week: string; view: "Agenda" | "Week"; onWeekChange: (week: string) => void; onViewChange: (view: "Agenda" | "Week") => void;
}) {
  const format = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div><h3 className="text-lg font-semibold">{format(week)} – {format(shiftDate(week, 6))}</h3><p className="text-xs text-muted-foreground">Meeting times retain their recorded time zone.</p></div>
    <div className="flex flex-wrap items-center gap-2"><div role="group" aria-label="Calendar date navigation" className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => onWeekChange(shiftDate(week, -7))}>Previous week</Button><Button variant="outline" onClick={() => onWeekChange(monday(dateOnly()))}>This week</Button><Button variant="outline" onClick={() => onWeekChange(shiftDate(week, 7))}>Next week</Button></div><div role="group" aria-label="Calendar view" className="flex gap-2">{(["Agenda", "Week"] as const).map(option => <Button key={option} aria-pressed={view === option} variant={view === option ? "default" : "outline"} onClick={() => onViewChange(option)}>{option}</Button>)}</div></div>
  </header>;
}

/** CalendarSwitch's child/label row, retained for host-owned display preferences. */
export function CalCalendarSwitch({ id, name, checked, onChange }: { id: string; name: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className="my-2 flex flex-row items-center"><div className="flex pl-2"><input id={id} type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} /></div><label className="ml-3 text-sm font-medium leading-5" htmlFor={id}>{name}</label></div>;
}

/** Calendar's day-column/EventList mapping, with stacked cards replacing absolute
 * overlapping time slots so long family names and meeting agendas stay readable. */
export function CalWeekAgenda({ rows, week, view, renderEvent }: { rows: Obligation[]; week: string; view: "Agenda" | "Week"; renderEvent: (row: Obligation) => ReactNode }) {
  const conflicts = useMemo(() => meetingConflictIds(rows), [rows]);
  const event = (row: Obligation) => <div key={row.id} data-calendar-event-id={row.id} className="space-y-1">{conflicts.has(row.id) && <p className="text-xs font-medium text-destructive">Overlapping meeting · {row.meeting!.timeZone}</p>}{renderEvent(row)}</div>;
  if (view === "Agenda") return <div className="space-y-2" aria-label="Calendar agenda">{rows.length ? rows.map(event) : <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No obligations in this week for these filters.</p>}</div>;
  return <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-7" aria-label="Calendar week">{Array.from({ length: 7 }, (_, i) => shiftDate(week, i)).map(day => <section key={day} className="min-w-0 rounded-md border p-2"><h3 className="mb-2 text-sm font-semibold">{new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}</h3><div className="space-y-2">{rows.filter(row => row.due === day).map(event)}{!rows.some(row => row.due === day) && <p className="text-xs text-muted-foreground">No obligations</p>}</div></section>)}</div>;
}
