import { ErpEstateOwnershipRegister } from "./erpnext-ownership-register";
import { useState } from "react";

import { Button } from "@fb/ui";

import { selectedProfileId } from "@/features/profiles/session";

import { FamilyOfficeShell } from "./family-office-shell";
import { EstateStructureComparison } from "./estate-structure-comparison";

import { GovernanceField as Field, GovernancePanel as Panel, GovernancePopulation, fieldClass, useGovernanceDraft } from "./governance-ui";

import { calculateIht, initialIht, ihtKey, ihtSchema, IHT_SOURCES, type IhtInput } from "./estate-iht-model";



import { readGovernance } from "./governance-model";

import { economicInterest } from "./governance-structures";

import { readFinanceBook, consolidateBook, dcfValue, fairValueWealth } from "./finance-book-model";

const gbp=(n:number)=>new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP",maximumFractionDigits:0}).format(n);

function Num({label,value,set}:{label:string;value:number;set:(v:number)=>void}) {return <Field label={label}><input type="number" min={0} step="any" className={fieldClass} value={value} onChange={e=>{if(e.target.value!=="")set(Number(e.target.value));}}/></Field>;}

function Check({label,value,set}:{label:string;value:boolean;set:(v:boolean)=>void}) {return <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={value} onChange={e=>set(e.target.checked)}/><span>{label}</span></label>;}

function Metrics({rows}:{rows:[string,number][]}) {return <div className="grid gap-3 md:grid-cols-3">{rows.map(([label,n])=><div key={label} className="rounded-md border p-3"><p className="text-sm">{label}</p><strong className="text-xl">{gbp(n)}</strong></div>)}</div>;}

export function EstateWorkspace() {

  const profile=selectedProfileId()??"static-demo";

  const state=useGovernanceDraft(ihtKey(profile),initialIht,v=>ihtSchema.parse(v));const {data,setData}=state;

  const [selectedAsset,setSelectedAsset]=useState<string|null>(null);
  const [gift,setGift]=useState(100000); const [fundingEntity,setFundingEntity]=useState("holding"); const [fundingAccess,setFundingAccess]=useState(false);

  let result:ReturnType<typeof calculateIht>|undefined;let error="";try{result=calculateIht(data);}catch(e){error=String(e);}

  const patch=<K extends keyof IhtInput>(key:K,value:IhtInput[K])=>setData({...data,[key]:value});

  return <div className="space-y-6">

    <p>English-law planning · GBP · dated UK IHT rules for 2025/26 and 2026/27. Assets, beneficiaries, gifts and relief eligibility drive the calculation.</p>

    {[state.loadError,state.error,state.message,error].filter(Boolean).map((m,i)=><p key={i} role="status" className="break-words rounded-md border p-3 text-sm">{m}</p>)}

    <div className="flex flex-wrap gap-2"><Button onClick={()=>state.save()}>Validate and save estate</Button><Button variant="outline" onClick={()=>setData(initialIht())}>Load fictional draft</Button></div>

    <Panel title="Event and scoped legal assumptions"><div className="grid gap-4 md:grid-cols-2"><Field label="Estate owner"><input className={fieldClass} value={data.owner} onChange={e=>patch("owner",e.target.value)}/></Field><Field label="Death / scenario date"><input type="date" min="2025-04-06" max="2027-04-05" className={fieldClass} value={data.deathDate} onChange={e=>patch("deathDate",e.target.value)}/></Field><Field label="Source / review rationale"><textarea className={fieldClass} value={data.source} onChange={e=>patch("source",e.target.value)}/></Field></div>

      <Check label="Scoped case confirmed: UK long-term resident; one free-estate component; no gifts with reservation, prior chargeable trust transfers, agricultural relief, downsizing, foreign property or pension complexities. Gift exemptions are individually reviewed." value={data.simpleEstateConfirmed} set={v=>patch("simpleEstateConfirmed",v)}/>

      <Check label="Spouse/civil-partner exemption conditions, including residence, are met in full for any spouse destination." value={data.spouseExemptionConfirmed} set={v=>patch("spouseExemptionConfirmed",v)}/>

      <p className="text-xs text-muted-foreground">Unconfirmed scope withholds results. Future dates outside the verified packs need a new rules review.</p>

      <div className="grid gap-3 md:grid-cols-2">{([ ["transferableNrbPercent","Transferred unused spouse nil-rate band (%)"],["transferableRnrbPercent","Transferred unused residence band (%)"],["transferredBrAllowance","Transferred business-relief allowance (£, up to £2.5m)"],["brAllowanceUsed","100% BR/APR allowance already used (£)"]] as const).map(([key,label])=><Num key={key} label={label} value={data[key]} set={v=>patch(key,v)}/>)}</div>

    </Panel>

    <Panel title="Asset, legal ownership and beneficiary register"><p className="text-sm">Use whole-asset gross values, attributable debt and the estate's economic share. Business rows are equity after company debt. Split rows for different beneficiaries. A holding company does not automatically qualify for relief.</p>

      <Button variant="outline" className="h-auto max-w-full whitespace-normal text-left" onClick={()=>{try{const f=readFinanceBook();if(f.currency!=="GBP"||f.dcf.currency!=="GBP")throw new Error("Convert source valuation to GBP first.");const g=readGovernance(localStorage,profile);const owner=g.people.find(p=>p.name===data.owner);if(!owner)throw new Error("Match an owner in governance first.");const existing=data.assets.find(a=>a.id==="business")??initialIht().assets[0];const holding=existing.entity==="family-holding";const wealth=fairValueWealth(f);if(holding&&wealth.errors.length)throw new Error(wealth.errors.join("; "));const target=holding?"family-holding":"operating-business";patch("assets",[{...existing,value:holding?wealth.fairValue:dcfValue(f.dcf).equity,share:g.entities.some(e=>e.id===target)?economicInterest(g.entities,target,owner.id):owner.ownership,legalOwner:owner.name,evidence:`${holding?"Holding-group equity including holding cash":"Whole-business DCF"} ${f.asOf}: ${f.dcf.source.slice(0,160)}; ownership applied once; relief inputs retained`},...data.assets.filter(a=>a.id!=="business")]);}catch(e){state.setError(String(e));}}}>Load financial valuation and saved ownership</Button>

      <ErpEstateOwnershipRegister assets={data.assets} onSelect={setSelectedAsset}/>
      <p className="text-sm text-muted-foreground">Select a holding to review ownership, beneficiaries, value and relief evidence.</p>
      {data.assets.map((a,i)=>{if(a.id!==selectedAsset)return null;const update=(v:Partial<typeof a>)=>patch("assets",data.assets.map((x,n)=>n===i?{...x,...v}:x));return <article key={a.id} className="space-y-3 rounded-md border p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold">{a.label}</h3><Button variant="outline" onClick={()=>setSelectedAsset(null)}>Close holding</Button></div><div className="grid gap-3 md:grid-cols-3">{(["label","entity","legalOwner","beneficiary","evidence"] as const).map(k=><Field key={k} label={k}><input className={fieldClass} value={a[k]} onChange={e=>update({[k]:e.target.value})}/></Field>)}<Field label="Treatment"><select className={fieldClass} value={a.kind} onChange={e=>update({kind:e.target.value as typeof a.kind})}>{[["cash","Cash / non-BR investments"],["home","Qualifying residence"],["business100","Unlisted qualifying trading business"],["business50","Qualifying 50% BR property"],["aim","Qualifying AIM shares"],["other","Other property"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>{([ ["value","Whole gross value (£)"],["debt","Asset-specific debt (£)"],["share","Estate economic share (%)"],["heldYears","Years owned"] ] as const).map(([k,l])=><Num key={k} label={l} value={a[k]} set={v=>update({[k]:v})}/>)}<Field label="Destination"><select className={fieldClass} value={a.destination} onChange={e=>update({destination:e.target.value as typeof a.destination})}><option value="family">Family / taxable recipient</option><option value="spouse">Exempt spouse / civil partner</option><option value="charity">Exempt charity</option></select></Field></div><Check label="Qualifying home passes outright to direct descendants" value={a.descendants} set={v=>update({descendants:v})}/><Check label="BR eligibility reviewed: qualifying business/property, no excepted investment assets or disqualifying sale/winding up" value={a.reliefEligible} set={v=>update({reliefEligible:v})}/><Button variant="outline" disabled={data.assets.length===1} onClick={()=>patch("assets",data.assets.filter((_,n)=>n!==i))}>Remove holding</Button></article>;})}

      <Button variant="outline" onClick={()=>{const holding={...initialIht().assets[2],id:crypto.randomUUID(),label:"New holding",value:0,evidence:"Source pending"};patch("assets",[...data.assets,holding]);setSelectedAsset(holding.id);}}>Add holding</Button>

    </Panel>

    <Panel title="Cash gifts and seven-year ledger"><p className="text-sm">Oldest chargeable gifts consume the nil-rate band first. Taper reduces gift tax above the band; it does not reduce gift value or restore the band. Gifts with reservation, trust settlements and business gifts are outside this cash-PET ledger.</p>{data.gifts.map((g,i)=>{const update=(v:Partial<typeof g>)=>patch("gifts",data.gifts.map((x,n)=>n===i?{...x,...v}:x));return <div key={g.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-3"><Field label="Gift date"><input type="date" className={fieldClass} value={g.date} onChange={e=>update({date:e.target.value})}/></Field>{(["recipient","source"] as const).map(k=><Field key={k} label={k}><input className={fieldClass} value={g[k]} onChange={e=>update({[k]:e.target.value})}/></Field>)}<Num label="Cash gift (£)" value={g.amount} set={v=>update({amount:v})}/><Num label="Reviewed exemption (£)" value={g.exempt} set={v=>update({exempt:v})}/><Button variant="outline" onClick={()=>patch("gifts",data.gifts.filter((_,n)=>n!==i))}>Remove gift</Button></div>;})}<Button variant="outline" onClick={()=>patch("gifts",[...data.gifts,{id:crypto.randomUUID(),date:data.deathDate,recipient:"Next generation",amount:0,exempt:0,source:"Populate gift/exemption evidence"}])}>Add cash gift</Button></Panel>

    {result&&<Panel title="Calculated IHT and rule trace"><Metrics rows={[["Estate IHT",result.estateTax],["Gift-recipient IHT",result.giftTax],["Total family IHT",result.totalTax],["Business relief",result.businessRelief],["Remaining NRB",result.remainingNrb],["Residence band",result.rnrb]]}/><p>Rule pack {result.rulePack} · death rate {result.rate*100}% · estate payment deadline {result.dueDate}.</p>{result.warnings.map(w=><p key={w}>{w}</p>)}<details className="rounded-md border p-3 text-sm"><summary className="cursor-pointer">Calculation trace and gift allocation</summary><div className="space-y-2 mt-3"><p>Net estate before relief: {gbp(result.netEstate)}. Spouse exemption {gbp(result.spouseExemption)}; charity {gbp(result.charityExemption)}.</p><p>Business relief {gbp(result.businessRelief)}; available 100% BR allowance {result.brAllowance===null?"uncapped pre-April 2026":gbp(result.brAllowance)}. Qualifying excess gets 50% relief in the 2026/27 pack.</p><p>Full NRB {gbp(result.fullNrb)} less chronological gift usage = {gbp(result.remainingNrb)}.</p><p>Residence taper = max(0, net estate − £2m) / 2 = {gbp(result.taper)}. Reliefs and exemptions do not reduce the taper base.</p><p>Charity baseline, excluding residence band: {gbp(result.charityBaseline)}. Ten-percent threshold: {gbp(result.charityThreshold)}.</p><p>Taxable estate after reliefs, exemptions and available bands: {gbp(result.taxable)} × {result.rate*100}%.</p>{result.giftRows.map(g=><p key={g.id}>{g.date} · {g.recipient}: {gbp(g.chargeable)} chargeable, {gbp(g.bandUsed)} band used, {g.years} completed years, {g.rate*100}% rate, {gbp(g.tax)} tax.</p>)}</div></details></Panel>}

    <Panel title="Compare transfer timing"><Num label="Unencumbered cash gift to compare (£)" value={gift} set={setGift}/><p className="text-sm">Constant values and no growth/exemption: retain cash versus an identical gift 1, 4 or 7 completed years before the event. These alternatives do not alter saved inputs.</p><div className="grid gap-3 md:grid-cols-4">{[0,1,4,7].map(years=>{try{const clone=structuredClone(data);if(years){let left=gift;clone.assets=clone.assets.map(a=>{if(a.kind!=="cash"||a.destination!=="family"||a.debt>0)return a;const deduction=Math.min(a.value*a.share/100,left);left-=deduction;return {...a,value:a.share>0?a.value-deduction/(a.share/100):a.value};});if(left>0)throw new Error("Insufficient eligible cash");const date=new Date(data.deathDate);date.setUTCFullYear(date.getUTCFullYear()-years);clone.gifts.push({id:`compare-${years}`,date:date.toISOString().slice(0,10),recipient:"Comparison",amount:gift,exempt:0,source:"Hypothetical timing comparison"});}const c=calculateIht(clone);return <div key={years} className="rounded-md border p-3"><strong>{years?`Gift ${years} years earlier`:"Retain cash"}</strong><p>Total IHT {gbp(c.totalTax)}</p><p className="text-sm">Estate {gbp(c.estateTax)}; gift {gbp(c.giftTax)}</p></div>;}catch(e){return <p className="rounded-md border p-3 text-sm" key={years}>{String(e)}</p>;}})}</div></Panel>

    <Panel title="Succession liquidity by month"><div className="space-y-3 rounded-md border p-3"><Field label="Financial-book entity ID for funding"><input className={fieldClass} value={fundingEntity} onChange={e=>setFundingEntity(e.target.value)}/></Field><Check label="I am modelling an evidenced legal route to make this entity's unrestricted cash available to the estate; company cash is not automatically personal cash." value={fundingAccess} set={setFundingAccess}/><Button variant="outline" disabled={!fundingAccess} onClick={()=>{try{const book=readFinanceBook();if(book.currency!=="GBP")throw new Error("GBP financial-book reporting currency is required");const consolidated=consolidateBook(book);if(consolidated.errors.length)throw new Error("Reconcile the financial book before importing funding");const entity=consolidated.entityChecks.find(e=>e.id===fundingEntity);if(!entity||entity.restricted)throw new Error("Choose an existing unrestricted entity");setData({...data,openingFunding:entity.closingCash,source:`${data.source.slice(0,200)}; opening funding copied from ${entity.name}, ${book.asOf}: ${book.source.slice(0,150)}. Legal access is a scenario assumption.`});state.setMessage("Opening funding replaced from the reconciled book; no transfer executed.");state.setError("");}catch(e){state.setError(String(e));}}}>Load entity cash as funding assumption</Button></div><div className="grid gap-3 md:grid-cols-2">{([ ["openingFunding","Accessible funding at death (£)"],["monthlyFunding","Committed monthly funding (£)"],["eventCosts","Immediate event costs (£)"],["reserve","Protected cash reserve (£)"] ] as const).map(([k,l])=><Num key={k} label={l} value={data[k]} set={v=>patch(k,v)}/>)}</div>{data.funding.map((f,i)=>{const update=(v:Partial<typeof f>)=>patch("funding",data.funding.map((x,n)=>n===i?{...x,...v}:x));return <div key={f.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-3">{(["label","source"] as const).map(k=><Field key={k} label={k}><input className={fieldClass} value={f[k]} onChange={e=>update({[k]:e.target.value})}/></Field>)}<Num label="Accessible month (0–24)" value={f.month} set={v=>update({month:v})}/><Num label="Funding (£)" value={f.amount} set={v=>update({amount:v})}/><Button variant="outline" onClick={()=>patch("funding",data.funding.filter((_,n)=>n!==i))}>Remove funding</Button></div>;})}<Button variant="outline" onClick={()=>patch("funding",[...data.funding,{id:crypto.randomUUID(),label:"Funding commitment",month:6,amount:0,source:"Availability evidence pending"}])}>Add funding</Button><p className="text-sm">Estate tax reserved by month six, conservatively before the month-end deadline. No instalment election, borrowing or asset sale is assumed. Recipient gift tax is separate. Probate payments can require earlier funding.</p>{result&&<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Month","Funding","Costs + IHT due","Reserve","Surplus / (gap)"].map(h=><th key={h} className="p-2 border-b">{h}</th>)}</tr></thead><tbody>{result.liquiditySchedule.map(r=><tr key={r.month}><td className="p-2">{r.month}</td><td>{gbp(r.funding)}</td><td>{gbp(r.cumulativeDue)}</td><td>{gbp(r.reserve)}</td><td>{gbp(r.balance)}</td></tr>)}</tbody></table></div>}</Panel>

    <Panel title="Relevant-property trust lifecycle"><Check label="Separate simple UK cash trust: no prior chargeable transfers or related settlements; no earlier additions/exits, reliefs or retained benefit; all property relevant for ten years; settlor survives seven years. Not added to the death-estate result." value={data.trust.simpleConfirmed} set={v=>patch("trust",{...data.trust,simpleConfirmed:v})}/><div className="grid gap-3 md:grid-cols-3">{([ ["contribution","Gross cash settlement (£)"],["anniversaryValue","Net fund before ten-year charge (£)"],["exitValue","Capital exiting (£)"],["exitQuarters","Completed quarters in cycle (0–39)"] ] as const).map(([k,l])=><Num key={k} label={l} value={data.trust[k]} set={v=>patch("trust",{...data.trust,[k]:v})}/>)}<Field label="Entry-tax payer"><select className={fieldClass} value={data.trust.payer} onChange={e=>patch("trust",{...data.trust,payer:e.target.value as "trustees"|"settlor"})}><option value="trustees">Trustees from settlement</option><option value="settlor">Settlor pays in addition</option></select></Field></div><Check label="Exit occurs after first ten-year anniversary" value={data.trust.exitAfterAnniversary} set={v=>patch("trust",{...data.trust,exitAfterAnniversary:v})}/>{result?.trust?<><Metrics rows={[["Entry tax",result.trust.entryTax],["Trustees receive",result.trust.received],["Settlor estate reduction",result.trust.estateReduction],["Ten-year charge",result.trust.periodicTax],["Exit charge",result.trust.exitTax]]}/><p className="text-sm">Periodic effective rate {(result.trust.periodicRate*100).toFixed(3)}%; exit rate {(result.trust.exitRate*100).toFixed(3)}%. Trust NRB £325,000; no spouse transfer. Trustee-paid entry: 20% of excess. Settlor-paid entry grosses tax up to 25% of excess. Periodic charge: 6% of excess in this restricted case; exit rate uses completed quarters / 40.</p></>:<p>Trust result withheld until its scope is confirmed.</p>}</Panel>

    <EstateStructureComparison input={data} />
    <Panel title="Official rule sources"><p className="text-sm">Checked 2 November 2026. Eligibility is an input requiring evidence. Structure descriptions do not execute transfers. Stored earlier effective-rate scenarios remain separate from this statutory workbench.</p><ul className="list-disc pl-5 space-y-1 text-sm">{IHT_SOURCES.map(([label,href])=><li key={href}><a className="underline" href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></Panel>

    <GovernancePopulation data={data} initial={initialIht} parse={v=>ihtSchema.parse(v)} onImport={setData} filename="estate-iht-population.json"/>

  </div>;

}



export default function EstateStatutoryPage() { return <FamilyOfficeShell title="Estate & wealth structuring"><EstateWorkspace /></FamilyOfficeShell>; }
