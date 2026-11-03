import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { selectedProfileId } from "@/features/profiles/session";
import { downloadText } from "@/features/governance/constitution/workspace";
import { FamilyOfficeShell } from "./family-office-shell";
import { loadSources, parseSourcePack, SourcePackSchema, SourceSchema, sourceKey, sourceMarkdown, type SourceRecord } from "./source-model";

const blank = (): SourceRecord => ({ id: "", assignment: "", section: "", excerpt: "", interpretation: "", target: "governance", parameter: "", basis: "source-principle", status: "draft", reviewer: "" });
const destinations = { governance: "/office/governance", constitution: "/office/business?tab=constitution", estate: "/office/estate", finance: "/office/finance", simulation: "/office/simulation", operations: "/office" };
const inputClass = "w-full min-w-0 rounded-md border bg-background p-2 text-foreground";

export function SourcesWorkspace() {
  const profile = selectedProfileId() ?? "static-demo";
  const [initial] = useState(() => { try { return { sources: loadSources(localStorage, profile).sources, error: "" }; } catch { return { sources: [] as SourceRecord[], error: "Saved source register is invalid. Recover or replace it with a validated import; it has not been overwritten." }; } });
  const [sources, setSources] = useState(initial.sources);
  const [error, setError] = useState(initial.error);
  const [draft, setDraft] = useState(blank);
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  function save(next: SourceRecord[]) {
    const pack = SourcePackSchema.parse({schema:1,sources:next});
    localStorage.setItem(sourceKey(profile), JSON.stringify(pack)); setSources(pack.sources); setError("");
  }
  function submit() { try { if (initial.error && error) throw new Error("Recover saved data with a validated import first."); const row = SourceSchema.parse(draft); save([...sources.filter(s=>s.id !== row.id),row]); setDraft(blank()); setMessage("Source and intended binding saved. Review the parameter in its owning module before use."); } catch(e) { setError(e instanceof Error ? e.message : "Could not save"); } }
  return <div className="space-y-6">
    <p>Bring selected excerpts from any of the four assignments. Keep original source identity, the team's interpretation and additional modelling assumptions separate. No full constitution resubmission is needed.</p>
    {error && <p role="alert" className="rounded-md border p-3 text-destructive break-words">{error}</p>}
    {message && <p role="status">{message}</p>}
    <Card><CardHeader><CardTitle>Population checklist</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
      <p>1. Record source excerpts here. Record synthetic parameters as modelling assumptions.</p>
      <p>2. Populate people, ownership and responsibilities in Governance; financial snapshots and valuation assumptions in Financials.</p>
      <p>3. Review estate event assumptions, investment constraints and capital-use settings in their owning modules. Import/export controls use each module's validated schema.</p>
      <p>4. Bind reviewed excerpts to actual constraints in <Link className="underline" to="/office/policy">Executable family policy</Link>, review and activate the revision. The policy checks dependent planning actions and becomes invalid if a source changes. The separate <Link className="underline" to="/governance/constitution">portfolio-account IPS</Link> controls legacy account changes.</p>
      <p>5. Run scenarios, resolve warnings, export the board report and source register. Review source units, dates and family/entity identities before presenting the combined case.</p>
      <p>{sources.filter(s=>s.status === "reviewed").length} of {sources.length} source mappings reviewed. {sources.length === 0 ? "Assignment 1 material is pending; no linkage is claimed." : "Review status records your team's local review only."}</p>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Add or edit a source mapping</CardTitle></CardHeader><CardContent className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">{([ ["id","Stable source ID"], ["assignment","Assignment / team member"], ["section","Section / page / revision"], ["parameter","Target input or workflow"], ["reviewer","Reviewer"] ] as const).map(([key,label])=><label key={key} className="space-y-1 text-sm">{label}<input className={inputClass} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value,status:"draft"})}/></label>)}
      <label className="space-y-1 text-sm">Target module<select className={inputClass} value={draft.target} onChange={e=>setDraft({...draft,target:e.target.value as SourceRecord["target"],status:"draft"})}>{Object.keys(destinations).map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="space-y-1 text-sm">Basis<select className={inputClass} value={draft.basis} onChange={e=>setDraft({...draft,basis:e.target.value as SourceRecord["basis"],status:"draft"})}>{["source-principle","operational-interpretation","modelling-assumption"].map(x=><option key={x}>{x}</option>)}</select></label>
      <label className="space-y-1 text-sm">Review status<select aria-label="Review status" className={inputClass} value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as SourceRecord["status"]})}><option value="draft">Draft</option><option value="reviewed">Reviewed by named reviewer</option></select></label></div>
      <label className="block space-y-1 text-sm">Exact excerpt / explicit assumption<textarea aria-label="Exact excerpt / explicit assumption" rows={4} className={inputClass} value={draft.excerpt} onChange={e=>setDraft({...draft,excerpt:e.target.value,status:"draft"})}/></label>
      <label className="block space-y-1 text-sm">Operational interpretation<textarea rows={3} className={inputClass} value={draft.interpretation} onChange={e=>setDraft({...draft,interpretation:e.target.value,status:"draft"})}/></label>
      <Button onClick={submit}>Save mapping</Button>
    </CardContent></Card>
    <div className="space-y-3">{sources.map(s=><Card key={s.id}><CardHeader><CardTitle className="break-words">{s.id} · {s.status}</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p>{s.assignment} — {s.section}</p><blockquote className="whitespace-pre-wrap border-l-2 pl-3 break-words">{s.excerpt}</blockquote><p className="break-words">{s.interpretation}</p><p>{s.basis} · {s.parameter}</p><div className="flex flex-wrap gap-3"><Link className="underline" to={destinations[s.target]}>Open {s.target}</Link><Button variant="outline" onClick={()=>setDraft({...s})}>Edit</Button></div></CardContent></Card>)}</div>
    <Card><CardHeader><CardTitle>Portable source pack</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={()=>downloadText("Constitution - Source Pack.json",JSON.stringify({schema:1,sources},null,2),"application/json")}>Export JSON</Button><Button variant="outline" onClick={()=>downloadText("Constitution - Tool Trace.md",sourceMarkdown(sources),"text/markdown")}>Export trace</Button></div><label className="block text-sm">Paste a source-pack JSON export to replace this register<textarea className={inputClass} rows={5} value={importText} onChange={e=>setImportText(e.target.value)}/></label><Button variant="outline" onClick={()=>{try { const pack=parseSourcePack(importText); save(pack.sources); setMessage("Validated source pack imported."); } catch(e) { setError(e instanceof Error ? e.message : "Invalid source pack"); }}}>Validate & replace register</Button></CardContent></Card>
  </div>;
}

export default function SourcesPage() { return <FamilyOfficeShell title="Source register & population"><SourcesWorkspace /></FamilyOfficeShell>; }
