import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@fb/ui";
import { officeSnapshots } from "./operations-report";
import { consolidateBook } from "./finance-book-model";
import { calculateIht } from "./estate-iht-model";
import { activeConstitution, constitutionTraceCurrent } from "./constitution-pack-model";
import { dateOnly } from "./operations-model";

export function CaseStewardshipHome({profile}:{profile:string}) {
  const saved=officeSnapshots(localStorage,profile);
  const [owner,setOwner]=useState("All");
  const today=dateOnly();
  const obligations=saved.operations.status==="saved"?saved.operations.value.obligations:[];
  const owners=Array.from(new Set(obligations.map(o=>o.owner))).sort();
  const open=obligations.filter(o=>o.status==="Open"&&!o.scenario&&(owner==="All"||o.owner===owner)).sort((a,b)=>a.due.localeCompare(b.due));
  let cash="Not populated",cashSource="Save Financials to establish the source.",estate="Not populated",constitution="Not adopted";
  if(saved.book.status==="saved")try{
    const result=consolidateBook(saved.book.value);
    cash=result.errors.length?"Reconciliation required":new Intl.NumberFormat("en-GB",{style:"currency",currency:saved.book.value.currency,maximumFractionDigits:0}).format(result.unrestrictedCash);
    cashSource=`${saved.book.value.asOf} · ${saved.book.value.source}`;
  }catch{cash="Needs recovery";}
  if(saved.statutoryEstate.status==="saved")try{
    const result=calculateIht(saved.statutoryEstate.value);
    estate=new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(Math.max(...result.liquiditySchedule.map(r=>r.shortfall)));
  }catch{estate="Review assumptions";}
  try{const pack=activeConstitution(localStorage,profile);if(pack)constitution=Object.values(pack.parameters.sourceIds).every(id=>constitutionTraceCurrent(localStorage,profile,id))?`${pack.name} · revision ${pack.revision}`:"Source review required";}catch{constitution="Needs recovery";}
  const required=saved.governance.status==="saved"?saved.governance.value.continuity.filter(a=>a.required):[];
  const readiness=required.length?`${required.filter(a=>a.status==="complete").length} / ${required.length} evidenced`:"Not configured";
  return <section className="space-y-4" aria-label="Family stewardship priorities">
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      ["Unrestricted statement cash",cash,"/office/business?tab=financials"],
      ["Open overdue responsibilities",saved.operations.status==="saved"?String(open.filter(o=>o.due<today).length):"Not populated","/office"],
      ["Succession funding gap",estate,"/office/business?tab=estate"],
      ["Continuity readiness",readiness,"/office/business?tab=governance"],
    ].map(([label,value,to])=><Link key={label} to={to} className="rounded-md border bg-card p-4 text-card-foreground hover:bg-muted"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="mt-2 break-words text-xl font-semibold">{value}</dd><p className="mt-2 text-xs text-muted-foreground">Inspect source and review</p></Link>)}</dl>
    <div className="rounded-md border bg-card p-4 text-sm"><Link className="font-medium underline" to="/office/business?tab=constitution">Constitution: {constitution}</Link><p className="mt-2 break-words text-muted-foreground">Cash source: {cashSource}</p></div>
    <Card><CardHeader><CardTitle>Next responsibilities</CardTitle><p className="text-sm text-muted-foreground">The same owner/entity records used by Calendar and the board report.</p></CardHeader><CardContent className="space-y-3">
      <div className="max-w-sm"><label htmlFor="case-responsibility-owner" className="text-sm">View responsibilities for</label><select id="case-responsibility-owner" className="mt-1 w-full rounded-md border bg-background p-2" value={owner} onChange={e=>setOwner(e.target.value)}><option value="All">Everyone</option>{owners.map(name=><option key={name}>{name}</option>)}</select></div>
      {!open.length&&<p className="text-sm text-muted-foreground">{saved.operations.status==="saved"?"No open responsibilities for this view.":"Create responsibilities in the office calendar to populate this queue."}</p>}
      {open.slice(0,8).map(row=><Link to={row.sourceRoute||"/office"} key={row.id} className="block rounded-md border p-3 hover:bg-muted"><h3 className="font-medium">{row.title}</h3><p className="mt-1 text-sm text-muted-foreground">{row.due<today?"Overdue · ":""}{row.due} · {row.owner} · {row.entity}</p><p className="mt-1 break-words text-xs text-muted-foreground">{row.source}</p></Link>)}
      <div className="flex flex-wrap gap-4"><Link className="text-sm underline" to="/office">Open calendar and full action queue</Link><Link className="text-sm underline" to="/office/review">Stewardship findings and source review</Link></div>
    </CardContent></Card>
  </section>;
}
