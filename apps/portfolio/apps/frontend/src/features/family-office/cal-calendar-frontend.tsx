/**
 * Adapted from Cal.diy SchedulerHeading.tsx, Calendar.tsx, EventList.tsx,
 * CalendarSwitch.tsx and overlap.ts at 91eefbf9f460bac7d69327fea4d9560295390e0a.
 * Copyright (c) 2020-present Cal.com, Inc. MIT; see distributed calendar/LICENSE.
 * The host owns state, components, semantics and tokens; no Cal store/provider is loaded.
 */
import { useMemo, type ReactNode } from "react";
import { Button, Calendar } from "@fb/ui";
import "./donor-workspaces.css";
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

/** Cal DatePicker's compact sidebar contract, using the host DayPicker for keyboard/date semantics. */
export function CalSchedulerSidebar({ week, onWeekChange, people, member, onMemberChange, rows }: {
  week: string; onWeekChange: (week: string) => void; people: { id: string; name: string }[];
  member: string; onMemberChange: (id: string) => void; rows: Obligation[];
}) {
  return <aside className="cal-scheduler-sidebar" aria-label="Calendar navigation and members">
    <Calendar mode="single" weekStartsOn={1} selected={new Date(`${week}T12:00:00`)} onSelect={date => { if (date) onWeekChange(monday(dateOnly(date))); }} defaultMonth={new Date(`${week}T12:00:00`)} key={week.slice(0, 7)} />
    <div className="space-y-3 border-t p-4"><h3 className="text-sm font-semibold">Family calendars</h3>
      <button type="button" className="cal-member-row" aria-pressed={member === "All"} onClick={() => onMemberChange("All")}><span className="cal-member-dot"/><span>All family members</span><span className="ml-auto text-xs text-muted-foreground">{rows.filter(row => row.meeting).length}</span></button>
      {people.map(person => <button type="button" key={person.id} className="cal-member-row" aria-pressed={member === person.id} onClick={() => onMemberChange(person.id)}><span className="cal-member-initial" aria-hidden="true">{person.name.slice(0, 1)}</span><span className="min-w-0 break-words">{person.name}</span><span className="ml-auto text-xs text-muted-foreground">{rows.filter(row => row.meeting?.attendees.includes(person.id)).length}</span></button>)}
    </div>
  </aside>;
}

const minuteOfDay = (time: string) => { const [hour, minute] = time.split(":").map(Number); return hour * 60 + minute; };
/** Cal Calendar + DateValues + HorizontalLines + EmptyCell + EventList composition.
 * Each day keeps its own timed event layer. Empty half-hour cells open the SAME host meeting editor.
 * The donor sweep groups collisions; separate readable lanes replace its obscuring cascade. */
export function CalWeekAgenda({ rows, week, view, renderEvent, onSelectSlot }: {
  rows: Obligation[]; week: string; view: "Agenda" | "Week"; renderEvent: (row: Obligation) => ReactNode;
  onSelectSlot?: (day: string, start: string) => void;
}) {
  const conflicts = useMemo(() => meetingConflictIds(rows), [rows]);
  const days = Array.from({ length: 7 }, (_, i) => shiftDate(week, i));
  const meetings = rows.filter(row => row.meeting);
  const startHour = Math.min(8, ...meetings.map(row => Math.floor(minuteOfDay(row.meeting!.start) / 60)));
  const endHour = Math.max(18, ...meetings.map(row => Math.ceil(minuteOfDay(row.meeting!.end) / 60)));
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const event = (row: Obligation) => <div key={row.id} data-calendar-event-id={row.id} className="space-y-1">{conflicts.has(row.id) && <p className="text-xs font-medium text-destructive">Overlapping meeting · {row.meeting!.timeZone}</p>}{renderEvent(row)}</div>;
  if (view === "Agenda") return <div className="space-y-5" aria-label="Calendar agenda">{days.map(day => {
    const dayRows = rows.filter(row => row.due === day);
    return dayRows.length ? <section key={day} className="cal-agenda-day"><h3 className="text-sm font-semibold">{new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</h3><div className="min-w-0 space-y-2">{dayRows.map(event)}</div></section> : null;
  })}{!rows.length && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No meetings this week. Choose a time in Week view to schedule one.</p>}</div>;
  return <div className="cal-week-scroll" aria-label="Calendar week"><div className="cal-week-grid">
    <div className="cal-date-values"><div className="cal-zone-label">Local<br/>time</div>{days.map(day => <div key={day} className="cal-date-value" data-today={day === dateOnly()}><span>{new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" })}</span><strong>{Number(day.slice(8))}</strong></div>)}</div>
    {rows.some(row => !row.meeting) && <div className="cal-all-day"><span className="cal-zone-label">All day</span>{days.map(day => <div key={day} className="min-w-0 space-y-2 p-2">{rows.filter(row => row.due === day && !row.meeting).map(event)}</div>)}</div>}
    <div className="cal-time-grid" style={{ height: `calc(var(--design-calendar-hour-height) * ${hours.length})` }}>
      <div className="cal-hours">{hours.map(hour => <div key={hour} className="cal-hour-label">{String(hour).padStart(2, "0")}:00</div>)}</div>
      {days.map(day => {
        const dayRows = meetings.filter(row => row.due === day);
        const groups = buildOverlapGroups(dayRows.map(row => ({ id: row.id, start: minuteOfDay(row.meeting!.start), end: Math.max(minuteOfDay(row.meeting!.end), minuteOfDay(row.meeting!.start) + 45) })));
        return <section key={day} aria-label={day} className="cal-day-column">
          <div className="cal-empty-cells">{Array.from({ length: hours.length * 2 }, (_, i) => {
            const start = `${String(startHour + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`;
            return <button type="button" key={start} aria-label={`Schedule meeting ${day} ${start}`} onClick={() => onSelectSlot?.(day, start)} className="cal-empty-cell"/>;
          })}</div>
          {dayRows.map(row => {
            const group = groups.find(group => group.some(event => event.id === row.id))!;
            const lane = group.findIndex(event => event.id === row.id);
            const start = minuteOfDay(row.meeting!.start), duration = Math.max(45, minuteOfDay(row.meeting!.end) - start);
            return <div key={row.id} data-calendar-event-id={row.id} className="cal-timed-event" data-conflict={conflicts.has(row.id)} style={{ top: `calc(var(--design-calendar-hour-height) * ${(start - startHour * 60) / 60})`, height: `calc(var(--design-calendar-hour-height) * ${duration / 60})`, left: `${100 * lane / group.length}%`, width: `${100 / group.length}%` }}>{renderEvent(row)}{conflicts.has(row.id) && <span className="sr-only">Overlapping meeting in {row.meeting!.timeZone}</span>}</div>;
          })}
        </section>;
      })}
    </div>
  </div></div>;
}
