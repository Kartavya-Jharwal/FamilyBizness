import { useState, type ReactNode } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { profileScope, selectedProfileId } from "@/features/profiles/session";

export const fieldClass = "mt-1 w-full rounded-md border bg-background p-2 text-foreground";
export function GovernanceField({ label, children }: { label: string; children: ReactNode }) { return <label className="block min-w-0 text-sm">{label}{children}</label>; }
export function GovernancePanel({ title, children }: { title: string; children: ReactNode }) { return <Card><CardHeader><CardTitle>{title}</CardTitle></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>; }
export function useGovernanceDraft<T>(key: string, initial: () => T, parse: (value: unknown) => T) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [data, setData] = useState<T>(() => { try { const raw = localStorage.getItem(key); return raw ? parse(JSON.parse(raw)) : initial(); } catch { return initial(); } });
  const [loadError] = useState(() => { try { const raw = localStorage.getItem(key); if (raw) parse(JSON.parse(raw)); return ""; } catch { return "Saved data could not be read. Showing an unsaved sample; use import to recover or explicitly save to replace the damaged record."; } });
  const save = (next = data) => { try { if (selectedProfileId()) profileScope(); const checked = parse(next); localStorage.setItem(key, JSON.stringify(checked)); setData(checked); setError(""); setMessage("Saved locally in this browser. No external record or legal instrument changed."); } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); } };
  return { data, setData, error, setError, message, setMessage, loadError, save };
}
export function GovernancePopulation<T>({ data, initial, parse, onImport, filename }: { data: T; initial: () => T; parse: (value: unknown) => T; onImport: (value: T) => void; filename: string }) {
  const [text, setText] = useState(""); const [error, setError] = useState("");
  const download = (value: T) => { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); };
  return <details className="rounded-md border p-4"><summary className="cursor-pointer font-medium">Populate from your selected assignment material</summary><div className="mt-4 space-y-3 text-sm"><p>Export a template, replace fictional inputs and source references, then import validated JSON. Import updates the draft; save explicitly to keep it. Imported approval records are local assertions, not authenticated approvals.</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => download(data)}>Export current JSON</Button><Button variant="outline" onClick={() => download(initial())}>Download sample template</Button></div><textarea aria-label="Population JSON" value={text} onChange={e => setText(e.target.value)} className={`${fieldClass} min-h-36 font-mono`} placeholder="Paste populated JSON" maxLength={250000} /><Button disabled={!text.trim()} onClick={() => { try { onImport(parse(JSON.parse(text))); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Invalid JSON."); } }}>Validate and load draft</Button>{error && <p role="alert" className="break-words">{error}</p>}</div></details>;
}
