import { preparedOfficeId } from "@/features/profiles/profile-workspace";
import { useProfile } from "@/features/profiles/profile-context";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@fb/ui";
import { selectedProfileId } from "@/features/profiles/session";
import { downloadText } from "@/features/governance/constitution/workspace";
import { caseDefaults, caseKey, caseSchema, exportCase, importCase, inspectCase, prepareCaseImport, type FamilyCase } from "./case-model";
const input = "w-full rounded-md border bg-background p-2 text-foreground";
export default function CaseAdministration() {
    const profiles = useProfile();
    const profile = selectedProfileId() ?? "static-demo";
    const [initial] = useState(() => { try {
        const raw = localStorage.getItem(caseKey(profile));
        return { value: raw ? caseSchema.parse(JSON.parse(raw)) : caseDefaults, error: "" };
    }
    catch (e) {
        return { value: caseDefaults, error: `Saved case could not be read: ${String(e)}` };
    } });
    const [draft, setDraft] = useState<FamilyCase>(initial.value);
    const [error, setError] = useState(initial.error);
    const [message, setMessage] = useState("");
    const [version, setVersion] = useState(0);
    const [raw, setRaw] = useState("");
    const [preview, setPreview] = useState<string[] | null>(null);
    const health = inspectCase(localStorage, profile);
    return <div className="space-y-4">{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
 {profile !== preparedOfficeId && <div className="rounded-md border p-4"><p className="mb-3 text-sm text-muted-foreground">The prepared family office combines selected provisions from all four constitutions. This earlier workspace is retained separately.</p><Button variant="outline" onClick={() => profiles?.selectProfile("office-role-0")}>Open prepared family office</Button></div>}

 <details className="rounded-md border p-4"><summary className="cursor-pointer font-medium">Office administration, saved records and backups</summary><div className="mt-4 space-y-4"><Card><CardHeader><CardTitle>Case identity & provenance</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm">This identifies the combined case; it does not rewrite legal entity names or source references in existing records. Use consistent IDs and units when populating those records.</p><div className="grid gap-3 md:grid-cols-2">{([['family', 'Family name'], ['business', 'Anchor business'], ['sourceAssignments', 'Selected assignments / sections'], ['preparedBy', 'Prepared by'], ['asOf', 'Case date']] as const).map(([key, label]) => <label key={key}>{label}<input className={input} type={key === 'asOf' ? 'date' : 'text'} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })}/></label>)}<label>Case basis<select className={input} value={draft.basis} onChange={e => setDraft({ ...draft, basis: e.target.value as FamilyCase['basis'] })}>{['single-assignment', 'composite-assignment', 'hypothetical'].map(v => <option key={v}>{v}</option>)}</select></label><label>Reporting currency<select className={input} value={draft.currency} onChange={e => setDraft({ ...draft, currency: e.target.value as FamilyCase['currency'] })}>{['GBP', 'USD', 'EUR'].map(v => <option key={v}>{v}</option>)}</select></label></div><label className="block">Family/business context<textarea className={input} rows={4} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })}/></label><Button onClick={() => { try {
        if (initial.error)
            throw new Error("Recover the invalid saved case with a validated pack before replacing it.");
        const p = caseSchema.parse(draft);
        localStorage.setItem(caseKey(profile), JSON.stringify(p));
        setVersion(version + 1);
        setError("");
        setMessage("Case identity saved. Financial and source records retain their own provenance.");
    }
    catch (e) {
        setError(String(e));
    } }}>Save case identity</Button></CardContent></Card>
 <Card><CardHeader><CardTitle>Saved data readiness</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm">Validation confirms structure, not the correctness of your assumptions or legal eligibility. Unsaved sample inputs do not count as populated case data.</p><div className="space-y-3">{health.map(row => <div key={row.id} className="rounded border p-3"><Link className="font-medium underline" to={row.route}>{row.name}</Link><span className="ml-3 text-sm">{row.status}</span><p className="mt-1 break-words text-sm text-muted-foreground">{row.detail}</p></div>)}</div></CardContent></Card>
 <Card><CardHeader><CardTitle>Portable case pack</CardTitle></CardHeader><CardContent className="space-y-3"><p className="text-sm">Exports saved modules listed above plus the active source-linked policy. Restore validates every included module and its source references before writing. Omitted modules are retained. Keep an export before replacing data.</p><Button variant="outline" onClick={() => { try {
        downloadText("Family Case - Planning Pack.json", JSON.stringify(exportCase(localStorage, profile), null, 2), "application/json");
        setError("");
    }
    catch (e) {
        setError(String(e));
    } }}>Export validated case pack</Button><label className="block">Import case-pack JSON<textarea rows={6} className={input} value={raw} onChange={e => { setRaw(e.target.value); setPreview(null); }}/></label><div className="flex flex-wrap gap-3"><Button variant="outline" onClick={() => { try {
        const plan = prepareCaseImport(raw, localStorage, profile);
        setPreview([...plan.names, ...(plan.hasPolicy ? ["active policy"] : [])]);
        setError("");
    }
    catch (e) {
        setPreview(null);
        setError(String(e));
    } }}>Validate import & preview</Button>{preview && <Button onClick={() => { try {
        importCase(raw, localStorage, profile);
        setVersion(version + 1);
        setPreview(null);
        setMessage("Case pack restored. Reload open workspaces to read restored inputs.");
        setError("");
    }
    catch (e) {
        setError(String(e));
    } }}>Replace included saved modules</Button>}</div>{preview && <p>Will replace: {preview.join(', ') || 'no modules'}.</p>}</CardContent></Card>
 </div></details>
 </div>;
}
