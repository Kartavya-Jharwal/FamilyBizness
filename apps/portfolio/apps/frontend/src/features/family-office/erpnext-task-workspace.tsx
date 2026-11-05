import { Input as NumericAwareInput } from "@fb/ui";
import { RollingNumberInput } from "@fb/ui";
/** ERPNext Task + Projects Workspace frontend adaptation; GPL-3.0. See erpnext-frontend.ts. */
import { useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import type { Obligation } from "./operations-model";
import { erpTaskBulkActions, erpTaskIndicators, erpTaskMask, erpProjectWorkspaceMask } from "./erpnext-frontend";
import { Stat } from "./visual-primitives";
import "./donor-workspaces.css";
const field = "fo-field w-full p-2 text-foreground";
export function erpTaskStatus(row: Obligation, today: string) {
  return row.status === "Complete" ? "Completed" : row.status === "Open" && row.due < today ? "Overdue" : row.status;
}
const taskProgress = (row: Obligation) => row.status === "Complete" ? 100 : row.task?.progress ?? 0;
const projectName = (row: Obligation) => row.task?.project || row.category || "Office operations";

/** Task list actions/indicators and Projects number-card/report composition retain the donor contract.
 * Every view below projects the SAME host operations records. */
export function ErpTaskList({ rows, today, onEdit, onBulkStatus }: {
  rows: Obligation[]; today: string; onEdit: (row: Obligation) => void;
  onBulkStatus: (ids: string[], status: "Open" | "Complete", evidence: string) => boolean;
}) {
  const [status, setStatus] = useState("Open"), [query, setQuery] = useState(""), [project, setProject] = useState("All");
  const [view, setView] = useState<(typeof erpProjectWorkspaceMask.views)[number]>(() => {
    const saved = localStorage.getItem("familybizness:erp-view"); return saved === "Board" || saved === "Projects" ? saved : "List";
  });
  const [selected, setSelected] = useState<string[]>([]), [evidence, setEvidence] = useState("");
  const projects = useMemo(() => [...new Set(rows.map(projectName))].sort(), [rows]);
  const filtered = useMemo(() => rows.filter(row => (status === "All" || (status === "Overdue" ? erpTaskStatus(row, today) === "Overdue" : row.status === status)) &&
    (project === "All" || projectName(row) === project) && `${row.title} ${row.entity} ${row.owner} ${projectName(row)}`.toLowerCase().includes(query.trim().toLowerCase())), [rows, status, query, project, today]);
  const activeSelected = selected.filter(id => rows.some(row => row.id === id));
  const allSelected = filtered.length > 0 && filtered.every(row => activeSelected.includes(row.id));
  const counts = { projects: projects.filter(name => rows.some(row => projectName(row) === name && row.status === "Open")).length, open: rows.filter(row => row.status === "Open").length };
  const projectRows = projects.map(name => { const tasks = rows.filter(row => projectName(row) === name); return { name, tasks, open: tasks.filter(row => row.status === "Open").length, overdue: tasks.filter(row => erpTaskStatus(row, today) === "Overdue").length, progress: Math.round(tasks.reduce((sum, row) => sum + taskProgress(row), 0) / tasks.length) }; });
  function apply(next: "Open" | "Complete") { if (onBulkStatus(activeSelected, next, evidence.trim())) { setSelected([]); setEvidence(""); } }
  function chooseView(next: typeof view) { setView(next); localStorage.setItem("familybizness:erp-view", next); }
  function inspectProject(name: string) { setProject(name); setStatus("All"); chooseView("List"); }
  function taskCard(row: Obligation) { return <button key={row.id} className="erp-board-card space-y-3" onClick={() => onEdit(row)}><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-medium">{row.title}</h3><span className="text-xs text-muted-foreground">{row.task?.priority ?? "Medium"}</span></div><p className="text-xs text-muted-foreground">{projectName(row)}</p><div className="erp-progress-track" role="progressbar" aria-label={`${row.title} progress`} aria-valuenow={taskProgress(row)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${taskProgress(row)}%` }}/></div><div className="flex justify-between gap-2 text-xs text-muted-foreground"><span>{row.owner}</span><span>{row.due.slice(5)}</span></div></button>; }
  return <Card id="business-task-list"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="mb-1 text-xs text-muted-foreground">Family business / {erpProjectWorkspaceMask.title}</p><CardTitle><h2>Day-to-day work</h2></CardTitle></div><span className="rounded-full border px-3 py-1 text-xs">{rows.length} tasks in view</span></div></CardHeader><CardContent className="space-y-5">
    <div className="erp-workspace-summary">{erpProjectWorkspaceMask.numberCards.map(card => <Stat key={card.key} label={card.label} value={String(counts[card.key])}/>)}<Stat label={erpProjectWorkspaceMask.reports[1]} value={String(rows.filter(row => erpTaskStatus(row, today) === "Overdue").length)} detail="Open responsibilities past their due date"/></div>
    <div className="erp-workspace-modes" role="group" aria-label="Task workspace view">{erpProjectWorkspaceMask.views.map(mode => <Button key={mode} variant={view === mode ? "default" : "ghost"} aria-pressed={view === mode} onClick={() => chooseView(mode)}>{mode === "List" ? "Task list" : mode === "Board" ? "Task board" : "Project summary"}</Button>)}</div>
    {view === "Projects" ? <div className="overflow-x-auto"><table className="w-full text-left text-sm" aria-label="Project Summary"><thead><tr>{["Project", "Tasks", "Open", "Overdue", "Progress"].map(label => <th key={label} className="border-b p-3">{label}</th>)}</tr></thead><tbody>{projectRows.map(group => <tr key={group.name}><td className="border-b p-3"><button className="font-medium underline underline-offset-4" onClick={() => inspectProject(group.name)}>{group.name}</button></td><td className="border-b p-3">{group.tasks.length}</td><td className="border-b p-3">{group.open}</td><td className="border-b p-3">{group.overdue}</td><td className="min-w-32 border-b p-3"><span className="text-xs">{group.progress}%</span><div className="erp-progress-track mt-2"><span style={{ width: `${group.progress}%` }}/></div></td></tr>)}</tbody></table></div> : <>
    <div className="grid gap-3 sm:grid-cols-3"><div><label htmlFor="task-status" className="text-sm">Show tasks</label><select id="task-status" className={field} value={status} onChange={e => setStatus(e.target.value)}>{["Open", "Overdue", "Complete", "Cancelled", "All"].map(x => <option key={x}>{x}</option>)}</select></div><label className="text-sm">Project<select className={field} value={project} onChange={e => setProject(e.target.value)}><option>All</option>{projects.map(name => <option key={name}>{name}</option>)}</select></label><label className="text-sm">Find task, project or owner<input className={field} value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    {activeSelected.length > 0 && <fieldset className="space-y-3 rounded-md border bg-muted p-3"><legend className="px-2 text-sm font-medium">{activeSelected.length} selected tasks</legend><label className="block text-sm">Completion evidence<input className={field} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="Required before marking selected tasks complete" /></label><div className="flex flex-wrap gap-2">{erpTaskBulkActions.map(action => <Button key={action.status} variant="outline" disabled={action.status === "Complete" && !evidence.trim()} onClick={() => apply(action.status)}>{action.label}</Button>)}<Button variant="ghost" onClick={() => setSelected([])}>Clear selection</Button></div></fieldset>}
    {view === "Board" ? <div className="erp-task-board" aria-label="Task board">{["Overdue", "Open", "Completed", "Cancelled"].map(state => <section key={state} className="erp-board-column"><h3 className="mb-4 flex justify-between text-sm font-semibold"><span>{state}</span><span className="text-muted-foreground">{filtered.filter(row => erpTaskStatus(row, today) === state).length}</span></h3><div className="space-y-3">{filtered.filter(row => erpTaskStatus(row, today) === state).map(taskCard)}</div></section>)}</div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="border-b p-3"><input type="checkbox" aria-label="Select all visible tasks" checked={allSelected} onChange={e => setSelected(e.target.checked ? [...new Set([...selected, ...filtered.map(r => r.id)])] : selected.filter(id => !filtered.some(r => r.id === id)))} /></th>{["Task", "Company / project", "Owner", "Due", "Priority", "Progress", "Status"].map(h => <th className="border-b p-3" key={h}>{h}</th>)}</tr></thead><tbody>{filtered.map(row => {
      const indicator = erpTaskStatus(row, today);
      return <tr key={row.id}><td className="border-b p-3"><input type="checkbox" aria-label={`Select ${row.title}`} checked={activeSelected.includes(row.id)} onChange={e => setSelected(e.target.checked ? [...selected, row.id] : selected.filter(id => id !== row.id))} /></td><td className="border-b p-3"><button className="text-left font-medium underline" title={`Project: ${projectName(row)}; Assigned to: ${row.owner}; Progress: ${taskProgress(row)}%`} onClick={() => onEdit(row)}>{row.title}</button></td><td className="border-b p-3">{row.entity}<span className="block text-muted-foreground">{projectName(row)}</span></td><td className="border-b p-3">{row.owner}</td><td className="whitespace-nowrap border-b p-3">{row.due}</td><td className="border-b p-3">{row.task?.priority ?? "Medium"}</td><td className="min-w-24 border-b p-3"><span className="text-xs">{taskProgress(row)}%</span><div className="erp-progress-track mt-2"><span style={{ width: `${taskProgress(row)}%` }}/></div></td><td className={`border-b p-3 ${erpTaskIndicators[indicator]}`}>{row.scenario ? "Scenario · " : ""}{indicator}</td></tr>;
    })}</tbody></table></div>}
    {!filtered.length && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No tasks match this view. Change the status filter or add a task.</p>}
    <p className="text-xs text-muted-foreground">{filtered.length} tasks in this view</p></>}
  </CardContent></Card>;
}

/** Selected Task DocType quick-entry mask, with host field bindings replacing Frappe. */
export function ErpTaskFields({ draft, onChange }: { draft: Obligation; onChange: (value: Obligation) => void }) {
  const task = draft.task ?? { project: "", priority: "Medium" as const, progress: 0, startDate: "" };
  const simple = { subject: { key: "title", label: "Title", type: "text" }, company: { key: "entity", label: "Entity", type: "text" }, exp_end_date: { key: "due", label: "Due date", type: "date" } } as const;
  return <fieldset className="space-y-4"><legend className="font-medium">Task details</legend><div className="grid gap-4 sm:grid-cols-2">{erpTaskMask.map(mask => {
    const binding = simple[mask.fieldname as keyof typeof simple];
    if (binding) return <label key={mask.fieldname} className="text-sm">{binding.label}<NumericAwareInput required className={field} type={binding.type} value={draft[binding.key]} onChange={e => onChange({ ...draft, [binding.key]: e.target.value })} /></label>;
    if (mask.fieldname === "project") return <label className="text-sm" key={mask.fieldname}>{mask.label}<input className={field} value={task.project} onChange={e => onChange({ ...draft, task: { ...task, project: e.target.value } })} /></label>;
    if (mask.fieldname === "priority") return <div key={mask.fieldname}><label className="text-sm" htmlFor="erp-task-priority">{mask.label}</label><select id="erp-task-priority" className={field} value={task.priority} onChange={e => onChange({ ...draft, task: { ...task, priority: e.target.value as typeof task.priority } })}>{mask.options.split("\n").map(option => <option key={option}>{option}</option>)}</select></div>;
    if (mask.fieldname === "progress") return <label className="text-sm" key={mask.fieldname}>Progress (%)<RollingNumberInput className={field} type="number" min={0} max={100} value={task.progress} onChange={e => { if (e.target.value !== "") onChange({ ...draft, task: { ...task, progress: e.target.valueAsNumber } }); }} /></label>;
    if (mask.fieldname === "exp_start_date") return <label className="text-sm" key={mask.fieldname}>Expected start date<input className={field} type="date" value={task.startDate} onChange={e => onChange({ ...draft, task: { ...task, startDate: e.target.value } })} /></label>;
    return null;
  })}<label className="text-sm">Responsible owner<input required className={field} value={draft.owner} onChange={e => onChange({ ...draft, owner: e.target.value })} /></label></div></fieldset>;
}
