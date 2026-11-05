import { RollingNumberInput } from "@fb/ui";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { selectedProfileId } from "@/features/profiles/session";
import { downloadText } from "@/features/governance/constitution/workspace";
import { FamilyOfficeShell } from "./family-office-shell";
import { loadSources, type SourceRecord } from "./source-model";
import { activatePolicy, readEffectivePolicy, ruleKinds, policyKey, PolicyDraftSchema, type ExecutableRule, type EffectivePolicy } from "./policy-engine";

const field="w-full rounded-md border bg-background p-2 text-foreground";
export function PolicyWorkspace(){
  const profile=selectedProfileId()??"static-demo";
  const [initial]=useState(()=>{let sources:SourceRecord[]=[];try{sources=loadSources(localStorage,profile).sources;return {policy:readEffectivePolicy(localStorage,profile),sources,error:""};}catch(e){return {policy:null,sources,error:String(e)};}});
  const [active,setActive]=useState<EffectivePolicy|null>(initial.policy);
  const [savedDraft]=useState(()=>{try{const raw=localStorage.getItem(policyKey(profile));return raw?PolicyDraftSchema.parse(JSON.parse(raw)):null;}catch{return null;}});
  const [rules,setRules]=useState<ExecutableRule[]>(initial.policy?.rules??savedDraft?.rules??[]);
  const [currency,setCurrency]=useState<"GBP"|"USD"|"EUR">(initial.policy?.currency??savedDraft?.currency??"GBP");
  const [reviewer,setReviewer]=useState("");const [checked,setChecked]=useState(false);const [error,setError]=useState(initial.error);const [message,setMessage]=useState("");
  const [json,setJson]=useState("");
  function change(index:number,patch:Partial<ExecutableRule>){setRules(rules.map((r,i)=>i===index?{...r,...patch}:r));setChecked(false);}
  return <div className="space-y-6">
    <p>Turn selected constitutional principles into explicit operating rules. Each rule retains its reviewed source excerpt and interpretation. Activation freezes that source revision; changing it blocks dependent actions until the rules are reviewed again.</p>
    {error&&<p role="alert" className="break-words rounded border p-3 text-destructive">{error}</p>}{message&&<p role="status">{message}</p>}
    <Card><CardHeader><CardTitle>{active?`Active policy · revision ${active.revision}`:"No family policy activated"}</CardTitle></CardHeader><CardContent className="space-y-3">
      <p>{active?`${active.rules.length} rules · reviewed by ${active.reviewer} · ${active.activatedAt}`:"Add and review your selected excerpts in the source register, then bind rules below. Choose an adopted source to compile its rules."}</p>
      <Link className="underline" to="/office/sources">Manage source excerpts and review</Link>
      <p className="text-sm text-muted-foreground">Rules retain their source revision and apply to the family investment planner.</p>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Rule editor</CardTitle></CardHeader><CardContent className="space-y-4">
      <label className="block">Policy currency<select className={field} value={currency} onChange={e=>{setCurrency(e.target.value as typeof currency);setChecked(false);}}>{["GBP","USD","EUR"].map(c=><option key={c}>{c}</option>)}</select></label>
      {rules.map((r,i)=><fieldset key={i} className="space-y-3 rounded-md border p-4"><legend className="px-2 font-medium">Rule {i+1}</legend><div className="grid gap-3 md:grid-cols-2">
        <label>Rule ID<input className={field} value={r.id} onChange={e=>change(i,{id:e.target.value})}/></label>
        <label>Reviewed source<select aria-label="Reviewed source" className={field} value={r.sourceId} onChange={e=>change(i,{sourceId:e.target.value})}><option value="">Select source</option>{initial.sources.map(s=><option key={s.id} value={s.id} disabled={s.status!=="reviewed"}>{s.id} · {s.section} · {s.status}</option>)}</select></label>
        <label>Rule type<select className={field} value={r.kind} onChange={e=>change(i,{kind:e.target.value as ExecutableRule["kind"]})}>{ruleKinds.map(k=><option key={k}>{k}</option>)}</select></label>
        {r.kind!=="excluded-sector"&&<label>{r.kind==="approval-threshold"?"Amount above which approvals are required":r.kind==="reserve-minimum"?"Minimum reserve amount":"Percentage limit"}<RollingNumberInput type="number" min={0} className={field} value={r.value} onChange={e=>change(i,{value:Number(e.target.value)})}/></label>}
        {(r.kind==="approval-threshold"||r.kind==="excluded-sector")&&<label>{r.kind==="excluded-sector"?"Excluded sector (exact classification)":"Required distinct approvals"}<input className={field} value={r.text} onChange={e=>change(i,{text:e.target.value})}/></label>}
      </div><blockquote className="border-l-2 pl-3 text-sm">{initial.sources.find(s=>s.id===r.sourceId)?.excerpt??"Select a reviewed source to see the trace."}</blockquote><Button variant="outline" onClick={()=>{setRules(rules.filter((_,n)=>n!==i));setChecked(false);}}>Remove rule</Button></fieldset>)}
      <Button variant="outline" onClick={()=>{setRules([...rules,{id:`RULE-${rules.length+1}`,sourceId:"",kind:"cash-minimum",value:0,text:""}]);setChecked(false);}}>Add rule</Button>
      <p className="text-sm">Allocation percentages use the portfolio capital base. The annual distribution percentage uses gross fair-value family AUM from the selected wealth perimeter. Reserve rules check designated, funded cash in the Financials forecast; terminal real-wealth targets remain separate. Minimum reserves and approval thresholds use the selected policy currency. A sector screen excludes matching asset classifications; missing classifications must be resolved by the investment workspace.</p>
      <label className="block">Reviewer<input className={field} value={reviewer} onChange={e=>{setReviewer(e.target.value);setChecked(false);}}/></label>
      <label className="flex gap-2"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/>I have checked these interpretations, amounts, units and source excerpts.</label>
      <Button disabled={!checked} onClick={()=>{try{const next=activatePolicy(localStorage,profile,{currency,rules},reviewer);setActive(next);setError("");setMessage(`Revision ${next.revision} activated. Source-linked rules will be checked in the dependent workflows.`);setChecked(false);}catch(e){setError(String(e));}}}>Validate & activate rules</Button>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Portable rule draft</CardTitle></CardHeader><CardContent className="space-y-3"><Button variant="outline" onClick={()=>downloadText("Family Policy - Draft.json",JSON.stringify({currency,rules},null,2),"application/json")}>Export draft</Button><label className="block">Draft JSON<textarea rows={6} className={field} value={json} onChange={e=>setJson(e.target.value)}/></label><Button variant="outline" onClick={async()=>{try{const {PolicyDraftSchema}=await import("./policy-engine");const p=PolicyDraftSchema.parse(JSON.parse(json));setRules(p.rules);setCurrency(p.currency);setChecked(false);setError("");setMessage("Draft loaded. Source review and activation still required.");}catch(e){setError(String(e));}}}>Validate & load draft</Button></CardContent></Card>
  </div>;
}

export default function PolicyPage() { return <FamilyOfficeShell title="Executable family policy"><PolicyWorkspace /></FamilyOfficeShell>; }
