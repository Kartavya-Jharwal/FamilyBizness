import { preparedOfficeId } from "@/features/profiles/profile-workspace";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@fb/ui";
import { selectedProfileId } from "@/features/profiles/session";
import { distributionInputSchema, evaluateDistribution, evaluateReservedDecision, goldenBirdTraceCurrent, voteInputSchema, type DistributionInput } from "./golden-bird-rules";
import { DataTable, Metrics, NumberField, useScenario } from "./finance-ui";
import { financeBookSchema } from "./finance-book-model";
import { investmentSchema } from "./investment-model";
import { caseKey, caseSchema, importCase } from "./case-model";
import { activeConstitution, type ConstitutionPack } from "./constitution-pack-model";
import { ConstitutionLibrary } from "./constitution-library";
import { InputTable } from "./finance-input-table";
import { dateOnly, decodeOperations, operationsKey } from "./operations-model";
import { loadSources } from "./source-model";

export function ConstitutionChecksWorkspace() {
  const profile=selectedProfileId()??"static-demo";
  const [version,setVersion]=useState(0);
  let pack:ConstitutionPack|null=null;let error="";
  try{pack=activeConstitution(localStorage,profile);}catch(e){error=String(e);}
  return <div className="space-y-6"><details className="rounded-md border p-4" open={profile!==preparedOfficeId}><summary className="cursor-pointer text-sm font-medium">Constitution administration and revisions</summary><div className="mt-4"><ConstitutionLibrary profile={profile} onChange={()=>setVersion(v=>v+1)}/></div></details>{error&&<p role="alert" className="break-words text-destructive">{error}</p>}{pack?<ConstitutionRuleChecks key={`${pack.id}:${pack.revision}:${version}`} profile={profile} pack={pack}/>:<p className="rounded-md border bg-muted p-4">Add or import a constitution and adopt its reviewed parameters to enable this family's cash and voting checks.</p>}</div>;
}

function ConstitutionRuleChecks({profile,pack}:{profile:string;pack:ConstitutionPack}) {
  const cash = useScenario(`profile:${profile}:constitution-distribution:v1`, distributionInputSchema, {unrestrictedCash:0,unfundedDebtAndStatutory:0,monthlyFixedCosts:0,operatingReserveAlreadyFunded:0,approvedDignityReserve:0,dignityReserveAlreadyFunded:0,feesAndCosts:0,distributableProfitCapacity:0,reserveApproved:false,solvent:false,covenantClear:false,flagship:false,auditedComplianceYears:0});
  const vote = useScenario(`profile:${profile}:constitution-vote:v1`, voteInputSchema, {owners:[{id:"owner-1",rights:100,eligible:true,present:true,supports:false}],boardMembers:1,boardRecommending:0,outsideLargestBranchPresent:false,legalApprovalsConfirmed:false});
  const [message, setMessage] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [fundingEntity,setFundingEntity]=useState(()=>{try{const raw=localStorage.getItem(`profile:${profile}:family-office:book:1`);const b=raw?financeBookSchema.parse(JSON.parse(raw)):null;return b?.wealthOwnerIds[0]??b?.entities[0]?.id??"";}catch{return "";}});
  const currencySymbol=pack.currency==="GBP"?"£":pack.currency==="USD"?"$":"€";
  const money = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: pack.currency, maximumFractionDigits: 2 }).format(n);
  const p = pack.parameters;
  const distribution = evaluateDistribution(cash.value,p);
  const decision = evaluateReservedDecision(vote.value,p);
  let companyName=pack.name;
  try{const raw=localStorage.getItem(caseKey(profile));if(raw)companyName=caseSchema.parse(JSON.parse(raw)).business;}catch{/* Existing readiness panel reports invalid identity. */}
  let entities:{id:string;name:string}[]=[];
  try{const raw=localStorage.getItem(`profile:${profile}:family-office:book:1`);if(raw)entities=financeBookSchema.parse(JSON.parse(raw)).entities;}catch{/* Application validates before writes. */}
  let sourceError = "";
  let sourceRows: ReturnType<typeof loadSources>["sources"] = [];
  try { sourceRows = loadSources(localStorage, profile).sources; } catch (e) { sourceError = String(e); }
  let traced = false;
  try { traced = [distribution.sourceId, decision.sourceId].every(id => goldenBirdTraceCurrent(localStorage, profile, id)); } catch { /* Source error is displayed above. */ }
  const changeCash = (key: keyof DistributionInput, value: number | boolean) => cash.update({ ...cash.value, [key]: value });
  function recordReview() {
    try {
      if (!traced || !reviewer.trim()) throw new Error("Name the reviewer and load the case constitution before recording the review.");
      const key = operationsKey(profile);
      const raw = localStorage.getItem(key);
      const data = raw ? decodeOperations(raw) : { version: 1 as const, obligations: [] };
      const evidence = `${decision.sourceId}: ${decision.ownerPercent.toFixed(2)}% of eligible rights; ${vote.value.boardRecommending}/${vote.value.boardMembers} Board recommendations; quorum ${decision.presentVoters}/${vote.value.owners.filter(o=>o.eligible).length}; reviewer ${reviewer.trim()}. ${decision.passed ? "All reserved-decision checks passed." : "Further approvals required."}`;
      const row = { id: crypto.randomUUID(), title: "Reserved decision review", due: dateOnly(), owner: reviewer.trim(), entity: companyName, category: "Decision review", status: "Complete" as const, source: decision.sourceId, sourceRoute: "/office/governance", recurrence: "One-off", notes: JSON.stringify(vote.value), evidence, scenario: false };
      localStorage.setItem(key, JSON.stringify(decodeOperations(JSON.stringify({ ...data, obligations: [...data.obligations, row] }))));
      setMessage("Decision review recorded in the office log and board-report evidence.");
    } catch (e) { setMessage(String(e)); }
  }
  function applyDividendBudget() {
    try {
      if (!traced || distribution.blockers.length) throw new Error("Resolve the cash safeguards and load the case constitution first.");
      const raw=localStorage.getItem(`profile:${profile}:family-office:book:1`);
      if(!raw)throw new Error("Save this family's financial book before applying a dividend budget.");
      const book=financeBookSchema.parse(JSON.parse(raw));
      if (book.currency !== pack.currency) throw new Error("Match the constitution and financial-book currencies before applying a budget.");
      const rows = book.forecast.filter(r => r.entity === fundingEntity);
      if (!rows.length) throw new Error("Add the holding-company forecast before applying a dividend budget.");
      const next = financeBookSchema.parse({ ...book, source: `${book.source.split("; dividend budget")[0]}; dividend budget ${distribution.sourceId}`, forecast: book.forecast.map(r => r.entity === fundingEntity ? { ...r, distributions: distribution.allocations.permittedDividends / rows.length } : r) });
      const savedInvestment = localStorage.getItem(`profile:${profile}:family-office:investment:1`);
      const modules: Record<string, unknown> = { book: next };
      if (savedInvestment) {
        const investment = investmentSchema.parse(JSON.parse(savedInvestment));
        if(investment.currency!==pack.currency)throw new Error("Match the investment scenario currency before applying the spending budget.");
        modules.investments = { ...investment, spend: distribution.allocations.permittedDividends,
          source: `${investment.source.split("; spending")[0]}; spending ${distribution.sourceId}` };
      }
      importCase(JSON.stringify({ schema: 1, exportedAt: new Date().toISOString(), modules, policy: null }), localStorage, profile);
      setMessage(`${money(distribution.allocations.permittedDividends)} dividend budget applied across ${rows.length} holding-company forecast months${savedInvestment ? " and the multi-generation spending scenario" : ""}.`);
    } catch (e) { setMessage(String(e)); }
  }
  return <div className="space-y-6">
    <p>The family constitution sets the cash waterfall and reserved-decision tests below. Change the case inputs to see the effect, apply the dividend budget to Financials, or record a decision review for the office.</p>
    {!traced && <p className="rounded-md border bg-muted p-3 text-sm">The active constitution source has changed. Review it and adopt a new revision in the constitution library before applying these rules.</p>}
    {[sourceError, cash.error, vote.error].filter(Boolean).map((error, i) => <p key={i} role="alert" className="break-words text-destructive">{error}</p>)}
    {message && <p role="status" className="rounded-md border p-3">{message}</p>}
    <Card><CardHeader><CardTitle>Cash available for distribution</CardTitle><p className="text-sm text-muted-foreground">{pack.name} · {pack.currency} · remaining cash after funding safeguards</p></CardHeader><CardContent className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">{([
        ["unrestrictedCash", "Unrestricted realised cash"],
        ["unfundedDebtAndStatutory", `Debt and statutory payments still to fund over ${p.distributionDebtFundingMonths} months`],
        ["monthlyFixedCosts", "Monthly fixed operating costs"],
        ["operatingReserveAlreadyFunded", "Operating reserve already ring-fenced"],
        ["approvedDignityReserve", "Approved family reserve budget"],
        ["dignityReserveAlreadyFunded", "family reserve already ring-fenced"],
        ["feesAndCosts", "Additional fees and costs due"],
        ["distributableProfitCapacity", "Profits lawfully available for dividends"],
        ["auditedComplianceYears", "Audited flagship compliance years"],
      ] as const).map(([key, label]) => <NumberField key={key} label={key === "auditedComplianceYears" ? label : `${label} (${currencySymbol})`} min={0} step={key === "auditedComplianceYears" ? "1" : "any"} value={cash.value[key]} onChange={n => changeCash(key, key === "auditedComplianceYears" ? Math.floor(n) : n)} />)}</div>
      <p className="text-sm text-muted-foreground">Unrestricted cash excludes reserves already ring-fenced. Only reserve shortfalls are funded again. Restricted cash, unrealised gains and assumed emergency private-asset sales are excluded.</p>
      <div className="grid gap-3 sm:grid-cols-2">{([
        ["reserveApproved", "family reserve budget approved"], ["solvent", "Solvency and going-concern checks passed"],
        ["covenantClear", "No unresolved covenant warning"], ["flagship", "Apply flagship compliance gate"],
      ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cash.value[key]} onChange={e => changeCash(key, e.target.checked)} />{label}</label>)}</div>
      <DataTable headings={["Funding step", "Amount"]} rows={[["Debt and statutory payments", money(cash.value.unfundedDebtAndStatutory)], [`Top up ${p.distributionFixedCostReserveMonths}-month operating reserve`, money(distribution.operatingTopUp)], ["Top up family reserve", money(distribution.dignityTopUp)], ["Fees and costs", money(cash.value.feesAndCosts)], ["Cash headroom after funding", money(distribution.headroom)]]} />
      {distribution.blockers.map(b => <p key={b} className="rounded-md border p-3 text-sm">{b}</p>)}
      <Metrics rows={[[`${p.distributableCashAllocationPercent.coreReinvestmentAndReserves}% core reinvestment & reserves`, money(distribution.allocations.coreReinvestmentAndReserves)], [`${p.distributableCashAllocationPercent.permittedDividends}% permitted dividends`, money(distribution.allocations.permittedDividends)], [`${p.distributableCashAllocationPercent.ringFencedGrowth}% ring-fenced growth`, money(distribution.allocations.ringFencedGrowth)]]} />
      <label className="block text-sm">Funding entity<select className="mt-1 w-full rounded-md border bg-background p-2" value={fundingEntity} onChange={e=>setFundingEntity(e.target.value)}><option value="">Choose a saved entity</option>{entities.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></label>
      <Button disabled={!traced || !!distribution.blockers.length || !!cash.error} onClick={applyDividendBudget}>Apply dividend budget to Financials</Button>
    </CardContent></Card>
    <Card><CardHeader><CardTitle>Reserved decision review</CardTitle><p className="text-sm text-muted-foreground">{pack.name} · eligible disinterested voting rights plus Board recommendation</p></CardHeader><CardContent className="space-y-4">
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Owner", "Issued voting rights", "Eligible / no conflict", "Present", "Supports"].map(h => <th className="border-b p-3" key={h}>{h}</th>)}</tr></thead><tbody>{vote.value.owners.map((owner, i) => <tr key={owner.id}><td className="border-b p-3">{owner.id}</td><td className="border-b p-3">{owner.rights}%</td>{(["eligible", "present", "supports"] as const).map(key => <td className="border-b p-3" key={key}><input type="checkbox" aria-label={`${owner.id} ${key}`} checked={owner[key]} onChange={e => vote.update({ ...vote.value, owners: vote.value.owners.map((o, n) => n === i ? { ...o, [key]: e.target.checked } : o) })} /></td>)}</tr>)}</tbody></table></div>
      <InputTable title="Edit case voting-rights register" rows={vote.value.owners.map(o=>({id:o.id,rights:o.rights}))} columns={[{key:"id",label:"Owner ID"},{key:"rights",label:"Issued voting rights %",type:"number"}]} newRow={()=>({id:crypto.randomUUID(),rights:0})} onApply={owners=>vote.update({...vote.value,owners:owners.map(o=>({...o,eligible:true,present:true,supports:vote.value.owners.find(old=>old.id===o.id)?.supports??false}))})}/>
      <div className="grid gap-4 sm:grid-cols-2"><NumberField label="Board members" min={1} max={40} step="1" value={vote.value.boardMembers} onChange={n => vote.update({ ...vote.value, boardMembers: Math.floor(n), boardRecommending: Math.min(vote.value.boardRecommending, Math.floor(n)) })} /><NumberField label="Board recommending" min={0} max={vote.value.boardMembers} step="1" value={vote.value.boardRecommending} onChange={n => vote.update({ ...vote.value, boardRecommending: Math.floor(n) })} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={vote.value.outsideLargestBranchPresent} onChange={e => vote.update({ ...vote.value, outsideLargestBranchPresent: e.target.checked })} />Representation outside the largest branch is present where available</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={vote.value.legalApprovalsConfirmed} onChange={e => vote.update({ ...vote.value, legalApprovalsConfirmed: e.target.checked })} />Required company-law and instrument approvals confirmed</label>
      <DataTable headings={["Test", "Result"]} rows={[["Eligible rights denominator", `${decision.eligibleRights}% of issued rights`], ["Supporting eligible rights", `${decision.ownerPercent.toFixed(2)}% · ${p.reservedOwnerPercent}% required`], ["Quorum", `${decision.presentVoters} eligible voters present · ${decision.requiredVoters} required`], ["Board recommendation", `${vote.value.boardRecommending} recorded · ${decision.boardRequired} required`]]} />
      <p role="status" className="font-medium">{decision.passed ? "All reserved-decision checks passed." : "Further approvals or quorum evidence required."}</p>
      <label className="block text-sm">Review recorded by<input className="mt-1 w-full rounded-md border bg-background p-2" value={reviewer} onChange={e => setReviewer(e.target.value)} /></label>
      <Button variant="outline" disabled={!traced || !reviewer.trim() || !!vote.error} onClick={recordReview}>Record decision review in office log</Button>
    </CardContent></Card>
    <div className="flex flex-wrap gap-4 text-sm"><Link className="underline" to="/office/business?tab=financials">Financial reports & cash forecasts</Link><Link className="underline" to="/office/simulation">Risk, fees, drawdown & generation scenarios</Link><Link className="underline" to="/office/business?tab=estate">Estate & succession liquidity</Link><Link className="underline" to="/office">Calendar & office log</Link></div>
    <details className="rounded-md border p-4"><summary className="cursor-pointer text-sm">Constitution trace</summary><div className="mt-4 space-y-4 text-sm">{sourceRows.filter(s => [distribution.sourceId, decision.sourceId].includes(s.id)).map(s => <article key={s.id}><h3 className="font-medium">{s.id} · {s.section}</h3><p className="mt-2 whitespace-pre-wrap">{s.excerpt}</p><p className="mt-2 text-muted-foreground">{s.interpretation}</p></article>)}</div></details>
  </div>;
}
