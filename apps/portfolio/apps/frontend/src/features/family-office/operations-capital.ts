import { z } from "zod";
import type { FinanceInput } from "./finance-model";
import { governanceSchema, type Governance } from "./governance-model";
import { validDate } from "./operations-model";
const text=z.string().trim().min(1).max(2000);
const amount=z.number().finite().positive().max(1e12);
const date=z.string().refine(validDate,"Valid calendar date required");
export const capitalRecordSchema=z.object({id:text,title:text,kind:z.enum(["Grant","Venture"]),year:z.number().int().min(2000).max(2200),recipient:text,owner:text,requested:amount,source:text,purpose:text,diligence:z.string().max(5000),status:z.enum(["Draft","Diligence","Submitted","Approved","Rejected","Cancelled"]),decisionId:z.string(),ruleId:z.string(),history:z.array(z.object({at:z.string().datetime(),actor:text,action:text,evidence:text})).max(200)});
export const capitalPaymentSchema=z.object({id:text,recordId:text,date,amount,reference:text,evidence:text,recordedBy:text,kind:z.enum(["Payment","Refund"])});
export const capitalSchema=z.object({schema:z.literal(1),currency:z.enum(["GBP","USD","EUR"]),records:z.array(capitalRecordSchema).max(500),payments:z.array(capitalPaymentSchema).max(2000)}).superRefine((v,c)=>{
 if(new Set(v.records.map(r=>r.id)).size!==v.records.length||new Set(v.payments.map(r=>r.id)).size!==v.payments.length)c.addIssue({code:"custom",message:"Capital record and payment IDs must be unique"});
 if(new Set(v.payments.map(p=>p.reference)).size!==v.payments.length)c.addIssue({code:"custom",message:"Use a unique source transaction or line reference for each ledger entry"});
 for(const record of v.records)if(["Submitted","Approved"].includes(record.status)&&(!record.decisionId.trim()||!record.ruleId.trim()))c.addIssue({code:"custom",message:"Submitted and approved requests require a linked governance decision and rule"});
 for(const payment of v.payments)if(!v.records.some(r=>r.id===payment.recordId&&r.status==="Approved"))c.addIssue({code:"custom",message:"Every payment requires an approved capital record"});
 for(const record of v.records){let paid=0;for(const p of v.payments.filter(p=>p.recordId===record.id)){paid+=p.amount*(p.kind==="Refund"?-1:1);if(paid<-.001||paid>record.requested+.001)c.addIssue({code:"custom",message:"Payment ledger cannot overpay a commitment or refund more than recorded payments"});}}
});
export type Capital=z.infer<typeof capitalSchema>;
export type CapitalRecord=z.infer<typeof capitalRecordSchema>;
export type CapitalPayment=z.infer<typeof capitalPaymentSchema>;
export const capitalKey=(profile:string)=>`familybizness:capital:${profile}:1`;
export const initialCapital=():Capital=>({schema:1,currency:"GBP",records:[],payments:[]});
export function capitalTotals(data:Capital,kind:CapitalRecord["kind"],year:number){
 const rows=data.records.filter(r=>r.kind===kind&&r.year===year);const approved=rows.filter(r=>r.status==="Approved");const ids=new Set(approved.map(r=>r.id));
 const committed=approved.reduce((s,r)=>s+r.requested,0);const paid=data.payments.filter(p=>ids.has(p.recordId)).reduce((s,p)=>s+p.amount*(p.kind==="Refund"?-1:1),0);
 return {pipeline:rows.filter(r=>!["Cancelled","Rejected"].includes(r.status)).reduce((s,r)=>s+r.requested,0),committed,paid,outstanding:committed-paid};
}
export function budgetFor(finance:FinanceInput,kind:CapitalRecord["kind"]){return kind==="Grant"?finance.philanthropy:finance.ventures;}
export function proposeCapital(data:Capital,id:string,governance:Governance,ruleId:string,actor:string,evidence:string,at:string){
 capitalSchema.parse(data);governanceSchema.parse(governance);const row=data.records.find(r=>r.id===id);const rule=governance.rules.find(r=>r.id===ruleId);
 if(!row||row.status!=="Diligence"||!row.diligence.trim())throw new Error("Complete and record diligence before submitting.");
 if(!rule||rule.responsible!==actor)throw new Error("The selected rule's responsible participant must submit.");
 if(!evidence.trim())throw new Error("Submission evidence is required.");
 const decisionId=`capital:${id}`;
 if(governance.decisions.some(d=>d.id===decisionId))throw new Error("A governance proposal already exists for this capital record.");
 const nextGovernance=governanceSchema.parse({...governance,decisions:[...governance.decisions,{id:decisionId,title:`Capital request ${id}: ${row.title}`,ruleId,amount:row.requested,currency:data.currency,status:"submitted",note:evidence,history:[`${at}: ${actor} submitted ${row.kind} ${row.requested} ${data.currency}; source ${row.source}; diligence ${row.diligence}; ${evidence}`]}]});
 const nextCapital=capitalSchema.parse({...data,records:data.records.map(r=>r.id===id?{...r,status:"Submitted",ruleId,decisionId,history:[...r.history,{at,actor,action:"Submitted",evidence}]}:r)});
 return {governance:nextGovernance,capital:nextCapital};
}
export function transitionCapital(data:Capital,id:string,action:"Diligence"|"Approved"|"Rejected"|"Cancelled",actor:string,evidence:string,at:string,finance:FinanceInput & {budgetYear?:number},governance:Governance):Capital{
 capitalSchema.parse(data);const row=data.records.find(r=>r.id===id);if(!row)throw new Error("Capital request not found");
 if(!evidence.trim()||!actor.trim())throw new Error("Name the reviewer and record evidence.");
 if(!governance.people.some(p=>p.id===actor))throw new Error("Select a participant from the governance register.");
 if(["Rejected","Cancelled"].includes(row.status))throw new Error("This request is closed; create a new request instead.");
 if(action==="Diligence"&&row.status!=="Draft")throw new Error("Only a draft can enter diligence.");
 if(["Rejected","Cancelled"].includes(action)&&row.status==="Approved")throw new Error("Approved commitments cannot be erased. Record payments/refunds and preserve approval evidence.");
 if(action==="Approved"){
  const decision=governance.decisions.find(d=>d.id===row.decisionId&&d.status==="approved"&&d.title.includes(row.id));
  if(row.status!=="Submitted"||!decision)throw new Error("Approve the linked capital proposal in Governance first.");
  if(data.currency!==finance.currency)throw new Error("Capital and finance currencies differ; no implicit conversion.");
  if(row.year!==(finance.budgetYear??Number(finance.asOf.slice(0,4))))throw new Error("The request year must match the selected Financials budget year.");
  if(capitalTotals(data,row.kind,row.year).committed+row.requested>budgetFor(finance,row.kind)+.001)throw new Error("This approval exceeds the Financials capital-use budget.");
 }
 return capitalSchema.parse({...data,records:data.records.map(r=>r.id===id?{...r,status:action,history:[...r.history,{at,actor,action,evidence}]}:r)});
}
export function recordCapitalPayment(data:Capital,payment:CapitalPayment):Capital{
 capitalPaymentSchema.parse(payment);const row=data.records.find(r=>r.id===payment.recordId);if(!row||row.status!=="Approved")throw new Error("Only approved commitments can have externally evidenced payments.");
 return capitalSchema.parse({...data,payments:[...data.payments,payment]});
}

