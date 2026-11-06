import { useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
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
export function GovernancePopulation<T>(_props: { data: T; initial: () => T; parse: (value: unknown) => T; onImport: (value: T) => void; filename: string }) { return null; }
