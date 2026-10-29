import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { profileScope, selectedProfileId } from "@/features/profiles/session";
import { demoIpsFacts } from "@/adapters/static-store";
import { activateIps, assessIps, ipsKey, previewPolicy, readActiveIps, type ActiveIps } from "./ips";
import { clauseKey, compileSnapshot, downloadText, freshRecord, importText, INITIAL_DOCUMENT, loadWorkspace, MAX_DOCUMENT_LENGTH, saveWorkspace, workspaceKey } from "./workspace";
import { WORKING_POLICY_EXAMPLE } from "./examples";

export default function ConstitutionPage() {
  const profile = selectedProfileId() ?? "static-demo";
  const key = workspaceKey(profile);
  const [record, setRecord] = useState(freshRecord);
  const currentRecord = useRef(record);
  currentRecord.current = record;
  const [saved, setSaved] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeIps, setActiveIps] = useState<ActiveIps | null>(null);
  const [ipsError, setIpsError] = useState("");
  const [reviewed, setReviewed] = useState(false);
  useEffect(() => { setReviewed(false); }, [record.content, record.revision]);
  useEffect(() => { try { setActiveIps(readActiveIps(localStorage, profile)); setIpsError(""); } catch { setIpsError("Active IPS could not be loaded. Financial changes require review; enforcement has not been silently deactivated."); } }, [profile]);
  const ipsFacts = demoIpsFacts();
  const ipsFindings = activeIps ? assessIps(activeIps, ipsFacts) : [];
  const [view, setView] = useState("edit");
  const [importMode, setImportMode] = useState<"append" | "replace">("append");
  const [review, setReview] = useState({ key: "", source: "", text: "" });
  const input = useRef<HTMLInputElement>(null);
  const snapshot = useMemo(() => compileSnapshot(record), [record]);
  const draftFindings = previewPolicy(record.content, ipsFacts);
  const dirty = JSON.stringify(record) !== saved;
  const reload = () => {
    try { const next = loadWorkspace(localStorage, key); setRecord(next); setSaved(JSON.stringify(next)); setError(""); setMessage("Loaded local revision."); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load local data."); }
  };
  useEffect(reload, [key]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const save = () => {
    try {
      if ((selectedProfileId() ?? "static-demo") !== profile) throw new Error("The active profile changed. Reload before saving.");
      if (selectedProfileId()) profileScope();
      const next = saveWorkspace(localStorage, key, record); setRecord(next); setSaved(JSON.stringify(next)); setError(""); setMessage("Saved in this browser. No message was sent to another person.");
    } catch (e) { setError(e instanceof Error ? e.message : "Saving failed; your draft is still on screen."); }
  };
  return <main className="mx-auto max-w-7xl space-y-5 p-4 md:p-6">
    <header className="space-y-2"><p className="text-sm text-muted-foreground">Governance / Constitution</p><h1 className="text-2xl font-semibold">Constitution workspace</h1>
      <p className="max-w-3xl text-sm text-muted-foreground">Draft and review source clauses, then activate a saved revision as an Investment Policy Statement for local portfolio account changes. Extraction needs your review. No brokerage enforcement or legal approval is claimed.</p>
      <p className="text-sm">Revision {record.revision} · {dirty ? "Unsaved changes" : "Saved local state"}</p>
    </header>
    {error && <p role="alert" className="rounded-md border border-destructive p-3 text-sm">{error}</p>}
    {message && <p role="status" className="text-sm">{message}</p>}
    <Card><CardHeader><CardTitle>Investment Policy Statement</CardTitle></CardHeader><CardContent className="space-y-3 text-sm">
      {ipsError ? <p role="alert">{ipsError}</p> : <p>{activeIps ? `Active IPS revision ${activeIps.revision} · ${activeIps.currency} · all local accounts` : "No active IPS. Drafts do not enforce constraints."}</p>}
      <p className="text-muted-foreground">Local demo valuations as of {ipsFacts.asOf}. Supported: public equity, fixed-income and cash exposure percentages, plus private illiquid exposure. Denominator: total remaining fixture position value across all local accounts. Enforced operations: account creation/deletion and fixture reset. Currency, balance, archival, active-state and tracking-mode edits require review. Activity/trade/holding changes are unsupported and rejected while an IPS is active; historical trades do not recompute these fixtures.</p>
      <label className="flex items-start gap-2"><input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} /><span>I reviewed this saved revision, its extracted clauses, all-account scope and fixture denominator for local IPS enforcement.</span></label>
      <div className="flex flex-wrap gap-2"><Button disabled={!reviewed || dirty || record.revision === 0} onClick={() => { try { if (selectedProfileId()) profileScope(); setActiveIps(activateIps(localStorage, profile, record, ipsFacts.currency, reviewed)); setIpsError(""); setError(""); setMessage("Saved revision activated as the local IPS. Draft edits do not replace it."); } catch (e) { setError(e instanceof Error ? e.message : "IPS activation failed."); } }}>Activate saved revision as IPS</Button>
      {activeIps && <Button variant="outline" onClick={() => { if (!window.confirm("Deactivate local IPS enforcement? This does not change the saved document.")) return; try { if (selectedProfileId()) profileScope(); localStorage.removeItem(ipsKey(profile)); setActiveIps(null); setMessage("Local IPS deactivated explicitly."); } catch { setError("IPS deactivation failed."); } }}>Deactivate IPS</Button>}</div>
      {ipsFindings.map((finding) => <p key={finding.gateId} className="rounded-md border p-3">Revision {finding.revision}, line {finding.sourceLine}: {finding.clause}<br /><strong>{finding.status === "not_configured" ? "Needs review — unavailable" : finding.status}</strong> · {finding.message}</p>)}
    </CardContent></Card>
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => {
        if (record.content !== INITIAL_DOCUMENT && !window.confirm("Replace the on-screen draft with the fictional working example? Saved and active revisions stay unchanged until you explicitly save or activate.")) return;
        setRecord({ ...record, content: WORKING_POLICY_EXAMPLE });
        setError(""); setMessage("Working example loaded as an unsaved draft: four supported limits and two fenced optional review examples. Nothing was activated.");
      }}>Load working example</Button>
      <Button onClick={save} disabled={!dirty}>Save locally</Button>
      <Button variant="outline" onClick={() => { if (!dirty || window.confirm("Discard unsaved changes and load the saved revision?")) reload(); }}>Reload saved</Button>
      <Button variant="outline" onClick={() => downloadText("constitution-draft.md", record.content, "text/markdown")}>Export Markdown</Button>
      <Button variant="outline" onClick={() => downloadText("constitution-draft.json", JSON.stringify(compileSnapshot(record), null, 2), "application/json")}>Export JSON</Button>
    </div>
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Source document</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Document view"><Button variant={view === "edit" ? "default" : "outline"} onClick={() => setView("edit")}>Edit</Button><Button variant={view === "preview" ? "default" : "outline"} onClick={() => setView("preview")}>Text preview</Button></div>
        {view === "edit" ? <textarea aria-label="Constitution Markdown" className="min-h-96 w-full rounded-md border bg-background p-3 font-mono text-sm text-foreground" maxLength={MAX_DOCUMENT_LENGTH} value={record.content} onChange={(event) => setRecord({ ...record, content: event.target.value })} /> : <pre className="min-h-96 whitespace-pre-wrap break-words rounded-md border bg-background p-3 text-sm">{record.content}</pre>}
        <p className="text-xs text-muted-foreground">{record.content.length.toLocaleString()} / 60,000 characters. Preview displays source text without executing HTML or loading remote images.</p>
        <div className="flex flex-wrap items-center gap-2"><label className="text-sm">Import placement <select aria-label="Import placement" className="rounded border bg-background p-2" value={importMode} onChange={(e) => setImportMode(e.target.value as "append" | "replace")}><option value="append">Append</option><option value="replace">Replace</option></select></label><Button variant="outline" onClick={() => input.current?.click()}>Import verified text</Button></div>
        <input ref={input} type="file" className="sr-only" accept=".md,.markdown,.txt" aria-label="Import text file" onChange={async (event) => {
          const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
          try {
            if (!/\.(md|markdown|txt)$/i.test(file.name)) throw new Error("Only verified Markdown or plain text is supported; PDF/Word extraction is not connected.");
            if (file.size > MAX_DOCUMENT_LENGTH * 4) throw new Error("The text file is too large.");
            const text = await file.text();
            if (importMode === "replace" && !window.confirm("Replace the current draft with the selected text?")) return;
            const current = currentRecord.current;
            setRecord({ ...current, content: importText(current.content, text, importMode) }); setError(""); setMessage("Text imported into the draft; review before saving.");
          } catch (e) { setError(e instanceof Error ? e.message : "Import failed."); }
        }} />
      </CardContent></Card>
      <div className="space-y-5"><Card><CardHeader><CardTitle>Draft policy checks</CardTitle></CardHeader><CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{snapshot.policy.gates.length} detected. Read-only preview against the current local fixtures; these checks do not activate the draft. Every original clause remains in the source.</p>
        {snapshot.policy.gates.map((gate, index) => {
          const finding = draftFindings[index];
          return <section key={gate.id} className="space-y-2 rounded-md border p-3"><p className="text-xs text-muted-foreground">Line {gate.sourceLine} - {gate.recognitionStatus === "executable" ? "Recognized candidate" : "Needs definition"}</p><p className="break-words text-sm">{gate.statement}</p><p className="text-sm"><strong>Draft preview: {finding.status === "pass" ? "Pass" : finding.status === "breach" ? "Limit exceeded" : "Needs review"}</strong> - {finding.message}</p><p className="text-xs text-muted-foreground">Interpretation: {gate.assetClass ?? gate.field} - {gate.comparator} - {gate.threshold ?? "No numeric threshold"} {gate.currency ?? gate.unit}</p><Button size="sm" variant="outline" onClick={() => setReview({ key: clauseKey(gate), source: gate.statement, text: "" })}>Add local review note</Button></section>;
        })}
        {review.key && <section className="space-y-2"><label className="text-sm">Local review note<textarea aria-label="Local review note" className="mt-2 w-full rounded-md border bg-background p-2" maxLength={2000} value={review.text} onChange={(e) => setReview({ ...review, text: e.target.value })} /></label><Button size="sm" disabled={!review.text.trim()} onClick={() => { setRecord({ ...record, notes: [...record.notes.filter((note) => note.key !== review.key), review] }); setReview({ key: "", source: "", text: "" }); setMessage("Note added to this draft; save locally to keep it."); }}>Keep draft note</Button></section>}
        {snapshot.notes.map((note) => <div key={note.key} className="rounded-md border p-3 text-sm"><strong>{note.stale ? "Source changed — review again" : "Local review note"}</strong><p className="whitespace-pre-wrap break-words">{note.text}</p></div>)}
      </CardContent></Card>
      <Card><CardContent className="pt-6"><details><summary className="cursor-pointer font-medium">Future modelling inputs</summary><div className="mt-4 space-y-3"><p className="text-sm text-muted-foreground">Optional planning checklist for future modules, not failed policy checks. Extracted values remain candidates; no missing financial assumption is filled automatically.</p>{snapshot.contract.domains.map((domain) => <details key={domain.id} className="rounded-md border p-3"><summary className="cursor-pointer text-sm font-medium">{domain.title} - {domain.assumptions.filter((a) => a.state === "missing").length} not supplied</summary><ul className="mt-3 space-y-2 text-sm">{domain.assumptions.map((assumption) => <li key={assumption.key}>{assumption.label}: {assumption.state === "supplied" ? `${String(assumption.value)} ${assumption.unit ?? ""} (candidate, line ${assumption.sourceLine})` : "Not supplied"}</li>)}</ul></details>)}</div></details></CardContent></Card></div>
    </div>
    <Link className="text-sm underline" to="/open-source">Source and attribution</Link>
  </main>;
}
