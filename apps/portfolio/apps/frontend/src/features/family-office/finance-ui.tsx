import { useState } from "react";
import { z } from "zod";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import type { ReactNode } from "react";

export function exportScenario(name: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 0);
}
export function useScenario<T>(key: string, schema: z.ZodType<T>, initial: T) {
  const [error, setError] = useState("");
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? schema.parse(JSON.parse(raw)) : initial; }
    catch { return initial; }
  });
  const [loadWarning, setLoadWarning] = useState(() => { try { const raw = localStorage.getItem(key); if (raw) schema.parse(JSON.parse(raw)); return ""; } catch { return "Saved input is invalid or unavailable. Showing fictional defaults; import valid data to replace it."; } });
  function update(next: T, recovery=false) { try { if(loadWarning&&!recovery)throw new Error("Saved data is invalid. Import a validated recovery file before replacing it; ordinary edits have not overwritten it.");const checked = schema.parse(next); localStorage.setItem(key, JSON.stringify(checked)); setValue(checked); setError(""); setLoadWarning(""); return true; } catch (e) { setError(e instanceof Error ? e.message : "Could not save input"); return false; } }
  async function importFile(file?: File) { if (!file) return; try { if (file.size > 1000000) throw new Error("Use JSON smaller than 1 MB"); update(schema.parse(JSON.parse(await file.text())),true); } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON"); } }
  return { value, update, importFile, error: error || loadWarning };
}
export function Section({ title, children }: { title: string; children: ReactNode }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>; }
export function NumberField({ label, value, onChange, step = "any", min, max }: { label: string; value: number; onChange: (value: number) => void; step?: string; min?: number; max?: number }) { return <label className="flex flex-col gap-1 text-sm"><span>{label}</span><input className="rounded-md border border-input bg-background px-3 py-2 text-foreground" type="number" value={value} step={step} min={min} max={max} onChange={e => { if (e.target.value !== "" && Number.isFinite(e.target.valueAsNumber)) onChange(e.target.valueAsNumber); }} /></label>; }
export function ScenarioControls({ onImport, onExport, onReset, error }: { onImport: (file?: File) => void; onExport: () => void; onReset: () => void; error: string }) { return <div className="space-y-2"><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={onExport}>Export inputs</Button><label className="cursor-pointer rounded-md border px-3 py-2 text-sm">Import inputs JSON<input aria-label="Import scenario JSON" className="block max-w-full text-xs" type="file" accept=".json" onChange={e => { onImport(e.target.files?.[0]); e.target.value = ""; }} /></label><Button variant="outline" onClick={onReset}>Reset sample inputs</Button></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>; }
export function Metrics({ rows }: { rows: [string, string][] }) { return <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(([label, value]) => <div key={label} className="rounded-md border p-3"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="break-words text-xl font-semibold">{value}</dd></div>)}</dl>; }
export function DataTable({ headings, rows }: { headings: string[]; rows: (string | number)[][] }) { return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{headings.map(h => <th className="border-b p-2" key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) => <td className="border-b p-2" key={j}>{v}</td>)}</tr>)}</tbody></table></div>; }
