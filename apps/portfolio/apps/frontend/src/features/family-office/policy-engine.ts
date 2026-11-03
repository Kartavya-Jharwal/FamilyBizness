import { z } from "zod";
import { loadSources, type SourceRecord } from "./source-model";

export const ruleKinds = ["cash-minimum", "equity-maximum", "illiquid-maximum", "distribution-maximum", "reserve-minimum", "excluded-sector", "approval-threshold"] as const;
export type RuleKind = typeof ruleKinds[number];
export const RuleSchema = z.object({ id:z.string().trim().min(1), sourceId:z.string().trim().min(1), kind:z.enum(ruleKinds), value:z.number().finite().nonnegative(), text:z.string().trim().max(300) }).superRefine((r,c)=>{
  if (["cash-minimum","equity-maximum","illiquid-maximum","distribution-maximum"].includes(r.kind) && r.value>100) c.addIssue({code:"custom",message:"Percentage must be between 0 and 100"});
  if (r.kind === "excluded-sector" && !r.text) c.addIssue({code:"custom",message:"Name the excluded sector"});
  if (r.kind === "approval-threshold" && (!/^\d+$/.test(r.text) || Number(r.text)<1 || Number(r.text)>20)) c.addIssue({code:"custom",message:"Required approvals must be an integer from 1 to 20"});
});
export type ExecutableRule = z.infer<typeof RuleSchema>;
export const PolicyDraftSchema = z.object({ currency:z.enum(["GBP","USD","EUR"]), rules:z.array(RuleSchema).min(1).max(100) }).superRefine((p,c)=>{
  if (new Set(p.rules.map(r=>r.id)).size!==p.rules.length) c.addIssue({code:"custom",message:"Rule IDs must be unique"});
});
const ActiveSchema = PolicyDraftSchema.extend({revision:z.number().int().positive(), reviewer:z.string().trim().min(1), activatedAt:z.string().datetime(), sources:z.record(z.string(),z.string())});
export type EffectivePolicy = z.infer<typeof ActiveSchema>;
export type PolicyFacts = {currency?:string; cashPercent?:number; equityPercent?:number; illiquidPercent?:number; distributionPercent?:number; reserveAmount?:number; sectors?:string[]; amount?:number; approvalCount?:number};
export type PolicyFinding = {ruleId:string; sourceId:string; kind:RuleKind; status:"pass"|"breach"|"missing"; observed:string; requirement:string};
export const policyKey = (profile:string)=>`profile:${profile}:office-effective-policy:v1`;
const fingerprint = (s:SourceRecord)=>JSON.stringify(s);
export function activatePolicy(store:Pick<Storage,"getItem"|"setItem">,profile:string,draft:unknown,reviewer:string,at=new Date().toISOString()) {
  const parsed=PolicyDraftSchema.parse(draft), sources=loadSources(store,profile).sources;
  const snapshots:Record<string,string>={};
  for (const rule of parsed.rules) {
    const source=sources.find(s=>s.id===rule.sourceId);
    if (!source || source.status!=="reviewed") throw new Error(`Rule ${rule.id}: source ${rule.sourceId} must exist and be reviewed before activation.`);
    snapshots[source.id]=fingerprint(source);
  }
  const previous=store.getItem(policyKey(profile));
  const revision=previous ? ActiveSchema.parse(JSON.parse(previous)).revision+1 : 1;
  const policy=ActiveSchema.parse({...parsed,revision,reviewer,activatedAt:at,sources:snapshots});
  store.setItem(policyKey(profile),JSON.stringify(policy));
  return policy;
}
export function readEffectivePolicy(store:Pick<Storage,"getItem">,profile:string):EffectivePolicy|null {
  const raw=store.getItem(policyKey(profile)); if(raw===null)return null;
  const policy=ActiveSchema.parse(JSON.parse(raw)),sources=loadSources(store,profile).sources;
  for(const rule of policy.rules){ const source=sources.find(s=>s.id===rule.sourceId); if(!source || source.status!=="reviewed" || fingerprint(source)!==policy.sources[rule.sourceId])throw new Error(`Policy revision ${policy.revision} requires review: source ${rule.sourceId} changed or was removed. Reactivate reviewed rules before proceeding.`); }
  return policy;
}
export function evaluateRules(policy:EffectivePolicy|null,facts:PolicyFacts,kinds:readonly RuleKind[]=ruleKinds):PolicyFinding[]{
  if(!policy)return [];
  return policy.rules.filter(r=>kinds.includes(r.kind)).map(r=>{
    let observed:number|undefined,limit=r.value,pass=false,requirement="",display="Unavailable";
    const money=["reserve-minimum","approval-threshold"].includes(r.kind);
    if(r.kind==="excluded-sector"){
      requirement=`Exclude ${r.text}`;
      if(facts.sectors){pass=!facts.sectors.some(s=>s.trim().toLowerCase()===r.text.toLowerCase());display=facts.sectors.join(", ")||"No sectors";}
      return {ruleId:r.id,sourceId:r.sourceId,kind:r.kind,status:facts.sectors ? (pass?"pass":"breach"):"missing",observed:display,requirement};
    }
    switch(r.kind){
      case "cash-minimum":observed=facts.cashPercent;requirement=`Cash ≥ ${limit}%`;pass=(observed??-Infinity)>=limit;break;
      case "equity-maximum":observed=facts.equityPercent;requirement=`Equities ≤ ${limit}%`;pass=(observed??Infinity)<=limit;break;
      case "illiquid-maximum":observed=facts.illiquidPercent;requirement=`Illiquid assets ≤ ${limit}%`;pass=(observed??Infinity)<=limit;break;
      case "distribution-maximum":observed=facts.distributionPercent;requirement=`Distributions ≤ ${limit}% of policy capital base`;pass=(observed??Infinity)<=limit;break;
      case "reserve-minimum":observed=facts.reserveAmount;requirement=`Reserve ≥ ${policy.currency} ${limit}`;pass=(observed??-Infinity)>=limit;break;
      case "approval-threshold":observed=facts.amount;requirement=`Above ${policy.currency} ${limit}: ${r.text} distinct approvals`;pass=observed!==undefined&&(observed<=limit||(facts.approvalCount!==undefined&&facts.approvalCount>=Number(r.text)));break;
    }
    const missing=observed===undefined||!Number.isFinite(observed)||(money&&facts.currency!==policy.currency)||(r.kind==="approval-threshold"&&observed>limit&&facts.approvalCount===undefined);
    return {ruleId:r.id,sourceId:r.sourceId,kind:r.kind,status:missing?"missing":pass?"pass":"breach",observed:missing?"Required facts or matching currency unavailable":String(observed),requirement};
  });
}
export function enforcePolicy(policy:EffectivePolicy|null,facts:PolicyFacts,kinds:readonly RuleKind[]){
  const blocked=evaluateRules(policy,facts,kinds).filter(f=>f.status!=="pass");
  if(blocked.length)throw new Error(blocked.map(f=>`${f.ruleId} (${f.sourceId}): ${f.requirement}; ${f.status}, observed ${f.observed}`).join("; "));
}
