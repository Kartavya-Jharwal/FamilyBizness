/** ERPNext Task frontend adaptation; GPL-3.0. See erpnext-frontend.ts and distributed notice. */
import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import type { Obligation } from "./operations-model";
import { erpTaskBulkActions, erpTaskIndicators, erpTaskMask } from "./erpnext-frontend";

const field = "w-full rounded-md border border-input bg-background p-2 text-foreground";
export function erpTaskStatus(row: Obligation, today: string) {
  return row.status === "Complete" ? "Completed" : row.status === "Open" && row.due < today ? "Overdue" : row.status;
}

/** Task list, status indicators, selected-item actions and project/assignee popup fields
 * retain the donor list-view contract. All mutations use the host's one operations store. */
export function ErpTaskList({ rows, today, onEdit, onBulkStatus }: {
  rows: Obligation[]; today: string; onEdit: (row: Obligation) => void;
  onBulkStatus: (ids: string[], status: "Open" | "Complete", evidence: string) => boolean;
}) {
  const [status, setStatus] = useState("Open");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [evidence, setEvidence] = useState("");
  const filtered = useMemo(() => rows.filter(row => (status === "All" || (status === "Overdue" ? erpTaskStatus(row, today) === "Overdue" : row.status === status)) &&
    `${row.title} ${row.entity} ${row.owner} ${row.task?.project ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())), [rows, status, query, today]);
  const activeSelected = selected.filter(id => rows.some(row => row.id === id));
  const allSelected = filtered.length > 0 && filtered.every(row => activeSelected.includes(row.id));
  function apply(next: "Open" | "Complete") {
    if (onBulkStatus(activeSelected, next, evidence.trim())) { setSelected([]); setEvidence(""); }
  }
  return <Card id="business-task-list"><CardHeader><CardTitle><h2>Day-to-day work</h2></CardTitle><p className="text-sm text-muted-foreground">Assigned work, progress and completion evidence.</p></CardHeader><CardContent className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2"><div><label htmlFor="task-status">Show tasks</label><select id="task-status" className={field} value={status} onChange={e => setStatus(e.target.value)}>{["Open", "Overdue", "Complete", "Cancelled", "All"].map(x => <option key={x}>{x}</option>)}</select></div><label>Find task, project or owner<input className={field} value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    {activeSelected.length > 0 && <fieldset className="space-y-3 rounded-md border bg-muted p-3"><legend className="px-2 text-sm font-medium">{activeSelected.length} selected tasks</legend><label className="block text-sm">Completion evidence<input className={field} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Required before marking selected tasks complete" /></label><div className="flex flex-wrap gap-2">{erpTaskBulkActions.map(action => <Button key={action.status} variant="outline" disabled={action.status === "Complete" && !evidence.trim()} onClick={() => apply(action.status)}>{action.label}</Button>)}<Button variant="ghost" onClick={() => setSelected([])}>Clear selection</Button></div></fieldset>}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="border-b p-3"><input type="checkbox" aria-label="Select all visible tasks" checked={allSelected} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...filtered.map(r => r.id)])] : selected.filter(id => !filtered.some(r => r.id === id)))} /></th>{["Task", "Company / project", "Owner", "Due", "Priority", "Progress", "Status"].map(h => <th className="border-b p-3" key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(row => {
      const indicator = erpTaskStatus(row, today);
      return <tr key={row.id}><td className="border-b p-3"><input type="checkbox" aria-label={`Select ${row.title}`} checked={activeSelected.includes(row.id)} onChange={e => setSelected(e.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))} /></td><td className="border-b p-3"><button className="text-left font-medium underline" title={`${row.task?.project ? `Project: ${row.task.project}; ` : ""}Assigned to: ${row.owner}; Progress: ${row.status === "Complete" ? 100 : row.task?.progress ?? 0}%`} onClick={() => onEdit(row)}>{row.title}</button></td><td className="border-b p-3">{row.entity}{row.task?.project && <span className="block text-muted-foreground">{row.task.project}</span>}</td><td className="border-b p-3">{row.owner}</td><td className="whitespace-nowrap border-b p-3">{row.due}</td><td className="border-b p-3">{row.task?.priority ?? "Medium"}</td><td className="border-b p-3">{row.status === "Complete" ? 100 : row.task?.progress ?? 0}%</td><td className={`border-b p-3 ${erpTaskIndicators[indicator]}`}>{row.scenario ? "Scenario · " : ""}{indicator}</td></tr>;
    })}</tbody></table></div>
    {!filtered.length && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No tasks match this view. Change the status filter or add a task.</p>}
    <p className="text-sm text-muted-foreground">{filtered.length} tasks</p>
  </CardContent></Card>;
}

/** Selected Task DocType quick-entry mask, with host field bindings replacing Frappe. */
export function ErpTaskFields({ draft, onChange }: { draft: Obligation; onChange: (value: Obligation) => void }) {
  const task = draft.task ?? { project: "", priority: "Medium" as const, progress: 0, startDate: "" };
  const simple = { subject: { key: "title", label: "Title", type: "text" }, company: { key: "entity", label: "Entity", type: "text" }, exp_end_date: { key: "due", label: "Due date", type: "date" } } as const;
  return <fieldset className="space-y-4"><legend className="font-medium">Task details</legend><div className="grid gap-4 sm:grid-cols-2">{erpTaskMask.map(mask => {
    const binding = simple[mask.fieldname as keyof typeof simple];
    if (binding) return <label key={mask.fieldname} className="text-sm">{binding.label}<input required className={field} type={binding.type} value={draft[binding.key]} onChange={e => onChange({ ...draft, [binding.key]: e.target.value })} /></label>;
    if (mask.fieldname === "project") return <label className="text-sm" key={mask.fieldname}>{mask.label}<input className={field} value={task.project} onChange={e => onChange({ ...draft, task: { ...task, project: e.target.value } })} /></label>;
    if (mask.fieldname === "priority") return <div key={mask.fieldname}><label className="text-sm" htmlFor="erp-task-priority">{mask.label}</label><select id="erp-task-priority" className={field} value={task.priority} onChange={e => onChange({ ...draft, task: { ...task, priority: e.target.value as typeof task.priority } })}>{mask.options.split("\n").map(option => <option key={option}>{option}</option>)}</select></div>;
    if (mask.fieldname === "progress") return <label className="text-sm" key={mask.fieldname}>Progress (%)<input className={field} type="number" min={0} max={100} value={task.progress} onChange={e => { if (e.target.value !== "") onChange({ ...draft, task: { ...task, progress: e.target.valueAsNumber } }); }} /></label>;
    if (mask.fieldname === "exp_start_date") return <label className="text-sm" key={mask.fieldname}>Expected start date<input className={field} type="date" value={task.startDate} onChange={e => onChange({ ...draft, task: { ...task, startDate: e.target.value } })} /></label>;
    return null;
  })}<label className="text-sm">Responsible owner<input required className={field} value={draft.owner} onChange={e => onChange({ ...draft, owner: e.target.value })} /></label></div></fieldset>;
}
