import { z } from "zod";
import { entitySchema, continuitySchema, validateEntities } from "./governance-structures";

const text = z.string().trim().min(1).max(500);
export const personSchema = z.object({ id: text, name: text, generation: z.number().int().min(1).max(10), relationship: text, role: text, ownership: z.number().min(0).max(100), voting: z.number().min(0).max(100) });
export const governanceSchema = z.object({
  schemaVersion: z.literal(1), family: text, business: text, source: text,
  people: z.array(personSchema).min(2).max(40),
  rules: z.array(z.object({ id: text, title: text, responsible: text, accountable: text, consulted: text, informed: text, source: text, approvers: z.array(text).max(40).default([]), minimumApprovals:z.number().int().min(1).max(40).default(1), continuityRequired:z.boolean().default(false) })).min(1).max(40),
  decisions: z.array(z.object({ id: text, title: text, ruleId: text, status: z.enum(["draft", "submitted", "approved", "rejected"]), note: z.string().max(2000), amount:z.number().finite().min(0).max(1e12).default(0), currency:z.enum(["GBP","USD","EUR"]).default("GBP"), approvals:z.array(z.object({actor:text,at:z.string().datetime(),note:text})).max(40).default([]), history: z.array(z.string().min(1).max(2500)).max(100) })).max(100),
  entities:z.array(entitySchema).max(40).default([]), continuity:z.array(continuitySchema).max(100).default([]),
  successionEvents: z.array(z.object({ id: text, at: z.string().datetime(), description: text, from: text, to: text, ownership: z.number().min(0).max(100), voting: z.number().min(0).max(100), before: z.array(personSchema), after: z.array(personSchema), source: text })).max(100).default([]),
}).superRefine((data, ctx) => {
  if (new Set(data.people.map(p => p.id)).size !== data.people.length) ctx.addIssue({ code: "custom", message: "Person IDs must be unique." });
  if (new Set(data.rules.map(p => p.id)).size !== data.rules.length) ctx.addIssue({ code: "custom", message: "Rule IDs must be unique." });
  if (new Set(data.decisions.map(p => p.id)).size !== data.decisions.length) ctx.addIssue({ code: "custom", message: "Decision IDs must be unique." });
  if (new Set(data.successionEvents.map(p => p.id)).size !== data.successionEvents.length) ctx.addIssue({ code: "custom", message: "Succession event IDs must be unique." });
  for (const field of ["ownership", "voting"] as const) if (Math.abs(data.people.reduce((sum, p) => sum + p[field], 0) - 100) > 0.001) ctx.addIssue({ code: "custom", message: `${field} must total 100%.` });
  for (const rule of data.rules) if (![rule.responsible, rule.accountable].every(id => data.people.some(p => p.id === id))) ctx.addIssue({ code: "custom", message: "Responsible and accountable IDs must identify family participants." });
  for (const decision of data.decisions) if (!data.rules.some(r => r.id === decision.ruleId)) ctx.addIssue({ code: "custom", message: "Each decision needs an existing rule." });
  try { validateEntities(data.entities,data.people.map(p=>p.id)); } catch(e) { ctx.addIssue({code:"custom",message:String(e)}); }
  for(const rule of data.rules) if(rule.approvers.some(id=>!data.people.some(p=>p.id===id)) || new Set(rule.approvers).size!==rule.approvers.length) ctx.addIssue({code:"custom",message:"Approvers must be unique existing people"});
  for(const d of data.decisions) if(new Set(d.approvals.map(a=>a.actor)).size!==d.approvals.length || d.approvals.some(a=>!data.people.some(p=>p.id===a.actor))) ctx.addIssue({code:"custom",message:"Decision approvals must identify distinct participants"});
  if(new Set(data.continuity.map(a=>a.id)).size!==data.continuity.length)ctx.addIssue({code:"custom",message:"Continuity IDs must be unique"});
  const visitAction=(id:string,path:Set<string>):boolean=>{if(path.has(id))return false;return (data.continuity.find(a=>a.id===id)?.dependsOn??[]).every(dep=>visitAction(dep,new Set([...path,id])));};
  if(data.continuity.some(a=>!visitAction(a.id,new Set())))ctx.addIssue({code:"custom",message:"Continuity dependencies must not contain cycles"});
  for(const a of data.continuity) {
    if(!data.people.some(p=>p.id===a.ownerId)||!data.people.some(p=>p.id===a.successorId))ctx.addIssue({code:"custom",message:"Continuity owners and successors must exist"});
    if(a.dependsOn.some(id=>id===a.id||!data.continuity.some(n=>n.id===id)))ctx.addIssue({code:"custom",message:"Continuity prerequisites must reference other actions"});
    if(a.status==="complete"&&(!a.evidence.trim()||a.dependsOn.some(id=>data.continuity.find(n=>n.id===id)?.status!=="complete")))ctx.addIssue({code:"custom",message:"Completed actions need evidence and completed prerequisites"});
  }
  for (const event of data.successionEvents) {
    try { const expected = successionScenario(event.before, event.from, event.to, event.ownership, event.voting); if (JSON.stringify(expected) !== JSON.stringify(event.after)) throw new Error("Mismatch"); }
    catch { ctx.addIssue({ code: "custom", message: "Succession event snapshots must reconcile to their recorded transfer." }); }
  }
});
export type Governance = z.infer<typeof governanceSchema>;
export type Person = z.infer<typeof personSchema>;
export const governanceKey = (profile: string) => `familybizness:governance:${profile}:1`;
export function initialGovernance(): Governance { return {
  schemaVersion: 1, family: "Illustrative family", business: "Illustrative operating company", source: "Synthetic planning fixture; replace with selected Assignment 1 excerpts",
  people: [
    { id: "founder", name: "Founder", generation: 1, relationship: "Parent of next generation", role: "Family chair", ownership: 60, voting: 60 },
    { id: "successor", name: "Next-generation leader", generation: 2, relationship: "Child of founder", role: "Managing director", ownership: 25, voting: 25 },
    { id: "steward", name: "Family steward", generation: 2, relationship: "Child of founder", role: "Office manager", ownership: 15, voting: 15 },
  ],
  rules: [
    { id: "investment", title: "Investment proposal", responsible: "steward", accountable: "founder", consulted: "Managing director; investment adviser", informed: "Family board", source: "Illustrative RACI; source clause pending", approvers:["founder","successor"], minimumApprovals:1, continuityRequired:false },
    { id: "distribution", title: "Family distribution", responsible: "steward", accountable: "founder", consulted: "Accountant; beneficiaries", informed: "Family board", source: "Illustrative RACI; source clause pending", approvers:["founder","successor"], minimumApprovals:1, continuityRequired:false },
    { id: "succession", title: "Succession readiness review", responsible: "successor", accountable: "founder", consulted: "Legal adviser; family members", informed: "Family board", source: "Illustrative RACI; source clause pending", approvers:["founder","successor"], minimumApprovals:1, continuityRequired:true },
  ], decisions: [], successionEvents: [],
  entities:[{id:"family-holding",name:"Family holding company",type:"holding-company",source:"Synthetic structure",owners:[{ownerId:"founder",economic:60,votes:60},{ownerId:"successor",economic:25,votes:25},{ownerId:"steward",economic:15,votes:15}]},{id:"operating-business",name:"Operating business",type:"operating-company",source:"Synthetic structure",owners:[{ownerId:"family-holding",economic:100,votes:100}]}],
  continuity:[{id:"mandate",title:"Confirm successor mandate and delegated authority",ownerId:"founder",successorId:"successor",trigger:"incapacity",status:"pending",evidence:"",source:"Hypothetical continuity policy",dueDate:"2026-12-01",dependsOn:[],required:true},{id:"handover",title:"Complete banking, records and signatory handover",ownerId:"steward",successorId:"successor",trigger:"retirement",status:"pending",evidence:"",source:"Hypothetical continuity policy",dueDate:"2026-12-01",dependsOn:["mandate"],required:true},{id:"liquidity",title:"Evidence funding and estate-liquidity review",ownerId:"steward",successorId:"successor",trigger:"death",status:"pending",evidence:"",source:"Hypothetical continuity policy",dueDate:"2026-12-01",dependsOn:[],required:true}],
}; }
export function readGovernance(storage: Pick<Storage, "getItem">, profile: string): Governance {
  const value = storage.getItem(governanceKey(profile));
  return value ? governanceSchema.parse(JSON.parse(value)) : initialGovernance();
}
export function successionScenario(people: Person[], from: string, to: string, ownership: number, voting: number) {
  z.array(personSchema).min(2).max(40).parse(people);
  if (new Set(people.map(p=>p.id)).size !== people.length || ["ownership","voting"].some(field => Math.abs(people.reduce((sum,p)=>sum + p[field as "ownership" | "voting"],0)-100)>0.001)) throw new Error("Validate the ownership register first: unique participants and 100% totals are required.");
  const donor = people.find(p => p.id === from);
  if (!donor || !people.some(p => p.id === to) || from === to) throw new Error("Choose two different existing participants.");
  if (![ownership, voting].every(n => Number.isFinite(n) && n >= 0) || ownership > donor.ownership || voting > donor.voting) throw new Error("Transfer cannot exceed the transferor's ownership or voting rights.");
  return people.map(p => ({ ...p, ownership: p.ownership + (p.id === from ? -ownership : p.id === to ? ownership : 0), voting: p.voting + (p.id === from ? -voting : p.id === to ? voting : 0) }));
}
export function transitionDecision(data: Governance, id: string, action: "submitted" | "approved" | "rejected", actor: string, note: string, at: string, policyApprovals=1): Governance {
  const checked=governanceSchema.parse(data);
  if(!Number.isFinite(Date.parse(at)))throw new Error("A valid event timestamp is required");
  const item=checked.decisions.find(d=>d.id===id);if(!item)throw new Error("Decision not found");
  const rule=checked.rules.find(r=>r.id===item.ruleId)!;
  if(!note.trim())throw new Error("Record evidence for the action");
  const eligible=rule.approvers.length?rule.approvers:[rule.accountable];
  if(action==="submitted" ? item.status!=="draft"||actor!==rule.responsible : item.status!=="submitted"||!eligible.includes(actor))throw new Error("Correct workflow stage and designated participant required");
  if(action==="approved"&&item.approvals.some(a=>a.actor===actor))throw new Error("This participant has already approved");
  if(action==="approved"&&rule.continuityRequired&&checked.continuity.some(a=>a.required&&a.status!=="complete"))throw new Error("Required continuity actions must be evidenced before succession approval");
  const approvals=action==="approved"?[...item.approvals,{actor,at,note}]:item.approvals;
  const count=new Set(approvals.map(a=>a.actor)).size;
  const status=action==="approved"?(count>=Math.max(rule.minimumApprovals,policyApprovals)&&approvals.some(a=>a.actor===rule.accountable)?"approved":"submitted"):action;
  return governanceSchema.parse({...checked,decisions:checked.decisions.map(d=>d.id===id?{...d,status,approvals,note,history:[...d.history,`${at}: ${actor} recorded ${action}; resulting status ${status}: ${note}`,`Rule ${rule.id}; accountable ${rule.accountable}; ${count} approvals; required ${Math.max(rule.minimumApprovals,policyApprovals)}; source ${rule.source}`]}:d)});
}