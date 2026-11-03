export type ObligationStatus = "Open" | "Complete" | "Cancelled";
export interface Obligation {
  id: string; title: string; due: string; owner: string; entity: string;
  category: string; status: ObligationStatus; source: string; sourceRoute: string;
  recurrence: string; notes: string; evidence: string; scenario: boolean;
  schedule?: { frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Annual"; until: string };
  seriesId?: string;
  workflowId?: string;
  task?: { project: string; priority: "Low" | "Medium" | "High" | "Urgent"; progress: number; startDate: string };
  meeting?: { start: string; end: string; timeZone: string; attendees: string[]; location: string; agenda: string };
}
export interface OperationsData { version: 1; obligations: Obligation[] }
export const operationsKey = (profile: string) => `familybizness:operations:${profile}:1`;
export function dateOnly(value = new Date()): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
export function validDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
export function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T12:00:00Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}
export function monday(date: string): string {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return shiftDate(date, -((day + 6) % 7));
}
export function initialOperations(today = dateOnly()): OperationsData {
  const base = { status: "Open" as const, notes: "", evidence: "", scenario: false };
  return { version: 1, obligations: [
    { ...base, id: "board", title: "Quarterly family-board review", due: shiftDate(today, 2), owner: "Family chair", entity: "Family", category: "Governance", source: "Illustrative quarterly review — replace with selected RACI", sourceRoute: "/governance/constitution", recurrence: "Quarterly; next occurrence requires manual creation" },
    { ...base, id: "reports", title: "Reconcile entity financial reports", due: shiftDate(today, -2), owner: "Finance lead", entity: "Operating business", category: "Reporting", source: "Illustrative reporting cadence; not a statutory deadline", sourceRoute: "/office/finance", recurrence: "Monthly; manual renewal" },
    { ...base, id: "policy", title: "Review constitution and investment policy", due: shiftDate(today, 4), owner: "Investment committee", entity: "Family", category: "Policy", source: "Illustrative review — no actual clause supplied", sourceRoute: "/governance/constitution", recurrence: "Annual; manual renewal" },
    { ...base, id: "liquidity", title: "Succession liquidity exercise", due: shiftDate(today, 5), owner: "Finance lead", entity: "Family", category: "Succession", source: "Fictional planning exercise; not a real succession event", sourceRoute: "/office/estate", recurrence: "One-off", scenario: true },
  ] };
}
export function sampleFamilyMeetings(today = dateOnly()): Obligation[] {
 const base = { status: "Open" as const, notes: "", evidence: "", scenario: false, entity: "Family", category: "Family meeting", source: "Fictional family meeting", sourceRoute: "/office/governance", recurrence: "One-off" };
 return [
  {...base,id:"family-council-meeting",title:"Family council meeting",due:shiftDate(today,2),owner:"Family chair",meeting:{start:"10:00",end:"11:30",timeZone:"Europe/London",attendees:["founder","successor","steward"],location:"Family office boardroom",agenda:"Review family priorities, constitution actions and succession responsibilities."}},
  {...base,id:"next-generation-meeting",title:"Next-generation planning conversation",due:shiftDate(today,3),owner:"Managing director",meeting:{start:"14:00",end:"15:00",timeZone:"Europe/London",attendees:["successor","steward"],location:"Family office",agenda:"Discuss stewardship responsibilities and the next family-business review."}},
 ];
}
export function validateObligation(row: Obligation): string | null {
  if (!row.title.trim() || !row.owner.trim() || !row.entity.trim()) return "Title, owner and entity are required.";
  if (!validDate(row.due)) return "Enter a valid due date.";
  if (row.status === "Complete" && !row.evidence.trim()) return "Record completion evidence before marking complete.";
  if (row.task !== undefined) {
    const task = row.task;
    if (!task || typeof task !== "object" || typeof task.project !== "string" || task.project.length > 500 || !["Low", "Medium", "High", "Urgent"].includes(task.priority) || !Number.isFinite(task.progress) || task.progress < 0 || task.progress > 100 || typeof task.startDate !== "string" || (task.startDate && (!validDate(task.startDate) || task.startDate > row.due))) return "Task details need a valid priority, progress from 0 to 100, and a start date on or before the due date.";
  }
  if (row.meeting !== undefined) {
    const m = row.meeting;
    if (!m || typeof m !== "object" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(m.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(m.end) || m.end <= m.start) return "Meeting end must follow its start on the same date.";
    if (!Array.isArray(m.attendees) || !m.attendees.length || m.attendees.length>40 || m.attendees.some(id=>typeof id!=="string"||!id.trim()) || new Set(m.attendees).size!==m.attendees.length) return "Choose distinct meeting participants.";
    if (typeof m.location!=="string" || typeof m.agenda!=="string" || m.location.length>500 || m.agenda.length>4000) return "Meeting location or agenda is invalid.";
    try { if(typeof m.timeZone!=="string"||!m.timeZone)throw new Error();new Intl.DateTimeFormat("en",{timeZone:m.timeZone}); } catch { return "Choose a valid meeting time zone."; }
  }
  if (row.schedule && (!["Daily", "Weekly", "Monthly", "Quarterly", "Annual"].includes(row.schedule.frequency) || !validDate(row.schedule.until) || row.schedule.until < row.due || row.schedule.until > shiftDate(row.due, 3660))) return "Recurrence needs a supported frequency and an end date within ten years after its anchor.";
  if (row.seriesId !== undefined && (typeof row.seriesId !== "string" || !row.seriesId.trim())) return "Series ID is invalid.";
  if (row.workflowId !== undefined && typeof row.workflowId !== "string") return "Workflow identity is invalid.";
  return null;
}
export function occurrenceDate(anchor: string, frequency: NonNullable<Obligation["schedule"]>["frequency"], index: number): string {
  if (!validDate(anchor) || !Number.isInteger(index) || index < 0 || index > 3660) throw new Error("Invalid recurrence position.");
  if (frequency === "Daily" || frequency === "Weekly") return shiftDate(anchor, index * (frequency === "Weekly" ? 7 : 1));
  const multiplier = frequency === "Monthly" ? 1 : frequency === "Quarterly" ? 3 : 12;
  const d = new Date(`${anchor}T12:00:00Z`);
  const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + multiplier * index);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last)); return d.toISOString().slice(0, 10);
}
export function scheduleOccurrences(data: OperationsData, through: string): OperationsData {
  decodeOperations(JSON.stringify(data));
  if (!validDate(through)) throw new Error("Choose a valid planning horizon.");
  const rows = [...data.obligations]; const ids = new Set(rows.map(r=>r.id));
  for (const root of data.obligations.filter(r=>r.schedule && !r.seriesId && r.status !== "Cancelled")) {
    for (let i = 1; i <= 3660; i++) {
      const due = occurrenceDate(root.due, root.schedule!.frequency, i);
      if (due > root.schedule!.until || due > through) break;
      const id = `${root.id}@${due}`;
      if (!ids.has(id)) { rows.push({...root, id, due, seriesId:root.id, schedule:undefined, status:"Open", evidence:"", notes:"", task:root.task?{...root.task,progress:0,startDate:root.task.startDate?shiftDate(root.task.startDate,Math.round((Date.parse(due)-Date.parse(root.due))/86400000)):""}:undefined, recurrence:`${root.schedule!.frequency} occurrence of ${root.id}`}); ids.add(id); }
      if (rows.length > 1000) throw new Error("This horizon exceeds 1,000 obligations; shorten the recurrence period.");
    }
  }
  return decodeOperations(JSON.stringify({version:1,obligations:rows}));
}
export function cancelFutureOccurrences(data: OperationsData, seriesId: string, after: string): OperationsData {
  if (!validDate(after)) throw new Error("Invalid cancellation date.");
  return decodeOperations(JSON.stringify({version:1,obligations:data.obligations.map(row => row.id === seriesId ? {...row,schedule:undefined,recurrence:"Series stopped"} : row.seriesId === seriesId && row.due > after && row.status === "Open" ? {...row,status:"Cancelled",notes:`Series stopped after ${after}. ${row.notes}`} : row)}));
}
export function decodeOperations(value: string): OperationsData {
  const data: unknown = JSON.parse(value);
  if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("obligations" in data) || !Array.isArray(data.obligations) || data.obligations.length > 1000) throw new Error("Unsupported operations file.");
  const ids = new Set<string>();
  for (const row of data.obligations) {
    if (!row || typeof row !== "object" || ["id", "title", "due", "owner", "entity", "category", "status", "source", "sourceRoute", "recurrence", "notes", "evidence"].some(key => typeof row[key] !== "string") || typeof row.scenario !== "boolean" || !["Open", "Complete", "Cancelled"].includes(row.status) || validateObligation(row) || ids.has(row.id) || !row.id) throw new Error("Invalid or duplicate obligation record.");
    if (row.sourceRoute && !["/office", "/office/governance", "/office/finance", "/office/estate", "/office/simulation", "/office/sources", "/governance/constitution", "/activities", "/office/review"].includes(row.sourceRoute)) throw new Error("Source links must point to a supported workspace.");
    ids.add(row.id);
  }
  return data as OperationsData;
}
// Adapted week filtering/order from Cal.diy BookingCalendarView, MIT; see public/open-source/calendar/NOTICE.md.
export function weekRows(rows: Obligation[], start: string): Obligation[] {
  const end = shiftDate(start, 7);
  return rows.filter(row => row.due >= start && row.due < end).sort((a, b) => a.due.localeCompare(b.due) || (a.meeting?.start??"").localeCompare(b.meeting?.start??"") || a.id.localeCompare(b.id));
}
export function operationsMetrics(rows: Obligation[], today: string) {
  const actual = rows.filter(row => !row.scenario);
  return { open: actual.filter(row => row.status === "Open").length, overdue: actual.filter(row => row.status === "Open" && row.due < today).length, complete: actual.filter(row => row.status === "Complete").length, scenarios: rows.filter(row => row.scenario).length };
}
export function boardReport(rows: Obligation[], today: string): string {
  const metrics = operationsMetrics(rows, today);
  return `# Family Office — Operations Review\n\nGenerated ${today}. Local prototype records; sample and scenario sources remain labelled.\n\nOpen: ${metrics.open}; overdue: ${metrics.overdue}; complete: ${metrics.complete}; scenario exercises: ${metrics.scenarios}.\n\n` + rows.map(row => `## ${row.title.replace(/[\r\n]/g, " ")}\n- Owner: ${row.owner}\n- Entity: ${row.entity}\n- Due: ${row.due} ${row.meeting ? `${row.meeting.start} - ${row.meeting.end} ${row.meeting.timeZone}` : "(all-day date)"}\n- Status: ${row.status}${row.scenario ? " — SCENARIO ONLY" : ""}\n- Source: ${row.source}\n- Linked workspace: ${row.sourceRoute || "None"}\n- Recurrence: ${row.recurrence}\n- Completion evidence: ${row.evidence || "Not supplied"}\n- Meeting participants: ${row.meeting?.attendees.join(", ") || "Not a meeting"}\n- Location: ${row.meeting?.location || "None"}\n- Agenda: ${row.meeting?.agenda || "None"}\n- Notes: ${row.notes || "None"}\n`).join("\n");
}

