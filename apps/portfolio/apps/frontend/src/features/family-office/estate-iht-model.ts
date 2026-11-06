import { z } from "zod";

const money = z.number().finite().min(0).max(1e11);
const text = z.string().trim().min(1).max(500);
export const legalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, "Use a valid calendar date");
export const ihtAssetSchema = z.object({ id:text, label:text, entity:text, legalOwner:text, beneficiary:text, kind:z.enum(["cash","home","business100","business50","aim","other"]), value:money, debt:money, share:z.number().min(0).max(100), destination:z.enum(["family","spouse","charity"]), descendants:z.boolean(), reliefEligible:z.boolean(), heldYears:z.number().min(0).max(150), evidence:text }).refine(v=>v.debt<=v.value,"Asset debt must not exceed gross value; model unsupported insolvency separately");
export const ihtGiftSchema = z.object({id:text,date:legalDate,recipient:text,amount:money,exempt:money,source:text}).refine(v=>v.exempt<=v.amount,"Gift exemption cannot exceed the gift");
export const ihtSchema = z.object({schemaVersion:z.literal(1), owner:text, deathDate:legalDate, source:text,
  simpleEstateConfirmed:z.boolean(), spouseExemptionConfirmed:z.boolean(), transferableNrbPercent:z.number().min(0).max(100), transferableRnrbPercent:z.number().min(0).max(100), transferredBrAllowance:money.max(2500000), brAllowanceUsed:money.max(5000000),
  assets:z.array(ihtAssetSchema).min(1).max(80), gifts:z.array(ihtGiftSchema).max(100),
  eventCosts:money, openingFunding:money, monthlyFunding:money, reserve:money,
  funding:z.array(z.object({id:text,label:text,month:z.number().int().min(0).max(24),amount:money,source:text})).max(50),
  trust:z.object({simpleConfirmed:z.boolean(), contribution:money, payer:z.enum(["trustees","settlor"]), anniversaryValue:money, exitValue:money, exitQuarters:z.number().int().min(0).max(39), exitAfterAnniversary:z.boolean()}),
}).superRefine((v,ctx)=>{
  for(const items of [v.assets,v.gifts,v.funding]) if(new Set(items.map(a=>a.id)).size!==items.length) ctx.addIssue({code:"custom",message:"Each record needs a unique ID"});
  if(v.gifts.some(g=>g.date>v.deathDate)) ctx.addIssue({code:"custom",message:"Gift date must not follow death"});
  if(v.deathDate<"2025-04-06" || v.deathDate>"2027-04-05") ctx.addIssue({code:"custom",message:"Verified rule packs cover 6 April 2025 to 5 April 2027 only"});
  if(v.brAllowanceUsed>2500000+v.transferredBrAllowance) ctx.addIssue({code:"custom",message:"Used business-relief allowance exceeds available allowance"});
});
export type IhtInput = z.infer<typeof ihtSchema>;
export const ihtKey=(profile:string)=>`familybizness:estate-iht:${profile}:1`;
export function initialIht():IhtInput {return {
  schemaVersion:1,owner:"Founder",deathDate:"2026-11-02",source:"Synthetic composite family case; replace legal eligibility evidence and values",simpleEstateConfirmed:true,spouseExemptionConfirmed:true,transferableNrbPercent:0,transferableRnrbPercent:0,transferredBrAllowance:0,brAllowanceUsed:0,
  assets:[
    {id:"business",label:"Operating business equity",entity:"operating-business",legalOwner:"Founder",beneficiary:"Next generation",kind:"business100",value:10000000,debt:0,share:60,destination:"family",descendants:false,reliefEligible:true,heldYears:20,evidence:"Fictional qualifying trading business; no investment/excepted assets or binding sale; eligibility requires review"},
    {id:"home",label:"Family residence",entity:"personal",legalOwner:"Founder",beneficiary:"Children",kind:"home",value:800000,debt:0,share:100,destination:"family",descendants:true,reliefEligible:false,heldYears:15,evidence:"Fictional qualifying residence left outright to direct descendants"},
    {id:"cash",label:"Personal investments and cash",entity:"personal",legalOwner:"Founder",beneficiary:"Family",kind:"cash",value:500000,debt:0,share:100,destination:"family",descendants:false,reliefEligible:false,heldYears:5,evidence:"Synthetic value; excludes funding owned by others"},
  ],gifts:[{id:"education-gift",date:"2024-06-01",recipient:"Next generation education fund",amount:25000,exempt:0,source:"Illustrative cash gift; exemption evidence pending"},{id:"housing-gift",date:"2022-09-01",recipient:"Adult family member",amount:75000,exempt:0,source:"Illustrative housing gift; no exemption assumed"}],eventCosts:50000,openingFunding:300000,monthlyFunding:20000,reserve:100000,funding:[{id:"insurance",label:"Insurance proceeds outside estate",month:3,amount:500000,source:"Fictional policy payable by month three; no estate inclusion assumed"}],
  trust:{simpleConfirmed:true,contribution:600000,payer:"trustees",anniversaryValue:800000,exitValue:100000,exitQuarters:20,exitAfterAnniversary:true},
};}
export function completedYears(from:string,to:string) {const a=new Date(from),b=new Date(to); return b.getUTCFullYear()-a.getUTCFullYear()-(b.getUTCMonth()<a.getUTCMonth() || (b.getUTCMonth()===a.getUTCMonth() && b.getUTCDate()<a.getUTCDate())?1:0);}
export function giftRate(years:number) {return years>=7?0:years>=6?.08:years>=5?.16:years>=4?.24:years>=3?.32:.4;}
export const IHT_SOURCES = [
  ["Bands, exemptions and death rate","https://www.gov.uk/inheritance-tax"],
  ["Residence band and pre-relief taper","https://www.gov.uk/guidance/inheritance-tax-residence-nil-rate-band"],
  ["Chronological gifts and taper","https://www.gov.uk/inheritance-tax/gifts"],
  ["Business relief effective 6 April 2026","https://www.gov.uk/business-relief-inheritance-tax/what-qualifies-for-business-relief"],
  ["Charity baseline (IHT430)","https://assets.publishing.service.gov.uk/media/668b94b97541f54efe51baec/IHT430-05-24_fillable.pdf"],
  ["Relevant-property trust charges","https://www.gov.uk/guidance/trusts-and-inheritance-tax"],
  ["Exit-rate quarter apportionment","https://www.gov.uk/hmrc-internal-manuals/inheritance-tax-manual/ihtm42114"],
  ["Death-tax payment deadline","https://www.gov.uk/paying-inheritance-tax"],
] as const;
export function calculateSimpleTrust(t:IhtInput["trust"]) {
  if(!t.simpleConfirmed) return null;
  const excess=Math.max(0,t.contribution-325000);
  const entryTax=excess*(t.payer==="settlor"?.25:.2);
  const received=t.contribution-(t.payer==="trustees"?entryTax:0);
  const estateReduction=t.contribution+(t.payer==="settlor"?entryTax:0);
  const periodicTax=Math.max(0,t.anniversaryValue-325000)*.06;
  const periodicRate=t.anniversaryValue>0?periodicTax/t.anniversaryValue:0;
  const beforeRate=t.contribution>0?Math.max(0,t.contribution-325000)*.06/t.contribution:0;
  const rate=(t.exitAfterAnniversary?periodicRate:beforeRate)*t.exitQuarters/40;
  if(t.exitValue>(t.exitAfterAnniversary?t.anniversaryValue:received)) throw new Error("Trust exit cannot exceed the available fund in this simplified case");
  if(!t.exitAfterAnniversary && t.payer==="settlor") throw new Error("Pre-anniversary exit with settlor-paid entry tax requires a grossed-up rate review; use trustee-paid entry or an after-anniversary exit");
  return {entryTax,received,estateReduction,periodicTax,periodicRate,exitRate:rate,exitTax:t.exitValue*rate};
}
export function calculateIht(raw:IhtInput) {
  const p=ihtSchema.parse(raw);
  if(!p.simpleEstateConfirmed) throw new Error("The estate includes unsupported components. Confirm the scoped case or obtain a bespoke calculation; no total is shown.");
  if(p.assets.some(a=>a.destination==="spouse") && !p.spouseExemptionConfirmed) throw new Error("Spouse exemption conditions are unconfirmed. No exemption or total is inferred.");
  const post2026=p.deathDate>="2026-04-06";
  const rows=p.assets.map(a=>({...a,net:(a.value-a.debt)*a.share/100}));
  const netEstate=rows.reduce((s,a)=>s+a.net,0);
  const spouseExemption=rows.filter(a=>a.destination==="spouse").reduce((s,a)=>s+a.net,0);
  const charityExemption=rows.filter(a=>a.destination==="charity").reduce((s,a)=>s+a.net,0);
  const qualifying=rows.filter(a=>a.destination==="family" && a.reliefEligible && a.heldYears>=2);
  const hundred=qualifying.filter(a=>a.kind==="business100" || (a.kind==="aim"&&!post2026)).reduce((s,a)=>s+a.net,0);
  const fifty=qualifying.filter(a=>a.kind==="business50" || (a.kind==="aim"&&post2026)).reduce((s,a)=>s+a.net,0);
  const allowance=Math.max(0,2500000+p.transferredBrAllowance-p.brAllowanceUsed);
  const businessRelief=(post2026?Math.min(hundred,allowance)+Math.max(0,hundred-allowance)*.5:hundred)+fifty*.5;
  const fullNrb=325000*(1+p.transferableNrbPercent/100);
  let remainingNrb=fullNrb;
  const giftRows=[...p.gifts].sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).map(g=>{
    const years=completedYears(g.date,p.deathDate);const chargeable=years>=7?0:g.amount-g.exempt;const bandUsed=Math.min(remainingNrb,chargeable);remainingNrb-=bandUsed;
    const rate=giftRate(years);return {...g,years,chargeable,bandUsed,taxable:chargeable-bandUsed,rate,tax:(chargeable-bandUsed)*rate};
  });
  const giftTax=giftRows.reduce((s,g)=>s+g.tax,0);
  const qualifyingHome=rows.filter(a=>a.kind==="home"&&a.destination==="family"&&a.descendants).reduce((s,a)=>s+a.net,0);
  const fullRnrb=175000*(1+p.transferableRnrbPercent/100);
  const taper=Math.max(0,netEstate-2000000)/2;
  const rnrb=Math.min(qualifyingHome,Math.max(0,fullRnrb-taper));
  const charityBaseline=Math.max(0,netEstate-spouseExemption-businessRelief-remainingNrb);
  const charityThreshold=charityBaseline*.1;
  const rate=charityExemption>0 && charityBaseline>0 && charityExemption>=charityThreshold?.36:.4;
  const taxable=Math.max(0,netEstate-spouseExemption-charityExemption-businessRelief-remainingNrb-rnrb);
  const estateTax=taxable*rate;
  const totalTax=estateTax+giftTax;
  const date=new Date(p.deathDate);const dueDate=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+7,0)).toISOString().slice(0,10);
  const liquiditySchedule=Array.from({length:13},(_,month)=>{
    const funding=p.openingFunding+p.monthlyFunding*month+p.funding.filter(f=>f.month<=month).reduce((s,f)=>s+f.amount,0);
    const due=p.eventCosts+(month>=6?estateTax:0);
    return {month,funding,reserve:p.reserve,cumulativeDue:due,balance:funding-p.reserve-due,shortfall:Math.max(0,due+p.reserve-funding)};
  });
  return {rulePack:post2026?"2026/27":"2025/26",netEstate,spouseExemption,charityExemption,businessRelief,brAllowance:post2026?allowance:null,fullNrb,remainingNrb,rnrb,taper,charityBaseline,charityThreshold,rate,taxable,estateTax,giftTax,totalTax,giftRows,dueDate,liquiditySchedule,trust:calculateSimpleTrust(p.trust),warnings:rows.filter(a=>["business100","business50","aim"].includes(a.kind)&&(!a.reliefEligible||a.heldYears<2)).map(a=>`${a.label}: business relief not applied; eligibility or two-year ownership not met.`)};
}
