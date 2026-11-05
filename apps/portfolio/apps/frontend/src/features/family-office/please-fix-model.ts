import { createOfficeReviewAction, initialOfficeReview, officeReviewKey, officeReviewSchema, findingFingerprint, type OfficeFinding } from "./office-review-model";
import { dateOnly, decodeOperations, operationsKey, type OperationsData } from "./operations-model";
import { loadSources } from "./source-model";
import { activeConstitution } from "./constitution-pack-model";
type Store=Pick<Storage,"getItem"|"setItem"|"removeItem">;
export type RepairOwner="Associate / family technician"|"Associate"|"Family technician";
export const repairOwners: readonly RepairOwner[] = ["Associate / family technician"];
export const normalRepairOwner=(owner:string)=>["Associate","Family technician","Associate / family technician"].includes(owner)?"Associate / family technician":owner;
const validRepairOwner=(owner:string)=>repairOwners.includes(normalRepairOwner(owner) as RepairOwner);
export const repairRole = (persona:string|null)=>persona==="office-role-0"?"patriarch":["office-role-4","office-role-6"].includes(persona??"")?"Associate / family technician":"observer";
function findingFor(store:Pick<Storage,"getItem">,profile:string,sourceId:string):OfficeFinding {
 const source=loadSources(store,profile).sources.find(row=>row.id===sourceId);
 if(!source)throw Error("Select a saved constitution clause.");
 const pack=activeConstitution(store,profile);
 return {id:`sources-legality-${source.id}`,title:`Constitution legality: ${source.section}`,detail:JSON.stringify({clause:source.excerpt,interpretation:source.interpretation,constitutionId:pack?.id,revision:pack?.revision}),status:"needs-review",source:source.id,sourceRoute:"/governance/constitution",asOf:pack?.adoptedAt};
}
export function sendPleaseFix(store:Store,profile:string,persona:string|null,sourceId:string,owner:RepairOwner,context:string){
 if(repairRole(persona)!=="patriarch")throw Error("The Patriarch sends a please fix request.");
 if(!validRepairOwner(owner))throw Error("Assign an Associate or Family technician.");
 const finding=findingFor(store,profile,sourceId),raw=store.getItem(officeReviewKey(profile)),state=raw?officeReviewSchema.parse(JSON.parse(raw)):initialOfficeReview;
 const key=operationsKey(profile),before=store.getItem(key);
 try {
  const result=createOfficeReviewAction(store,profile,state,finding,{findingId:finding.id,owner:normalRepairOwner(owner),evidence:context.trim()||"please fix — review the constitution legality and instrument linkage"});
  if(result.existing){const current=decodeOperations(store.getItem(key)!);store.setItem(key,JSON.stringify({...current,obligations:current.obligations.map(row=>row.id===result.actionId?{...row,notes:`${row.notes}\n${new Date().toISOString()} · Patriarch reissued against current clause\n${finding.detail}\n${context.trim()}`} : row)}));}
  return result;
 } catch(error){before===null?store.removeItem(key):store.setItem(key,before);raw===null?store.removeItem(officeReviewKey(profile)):store.setItem(officeReviewKey(profile),raw);throw error;}
}
export function repairRequests(store:Pick<Storage,"getItem">,profile:string){const raw=store.getItem(operationsKey(profile));return raw?decodeOperations(raw).obligations.filter(row=>row.title==="please fix").map(row=>({...row,owner:normalRepairOwner(row.owner)})):[];}
/** Generic ERP edits must not bypass the request's reviewed transition boundary. */
export function guardPleaseFixChanges(before:OperationsData,after:OperationsData){
 const beforeRows=new Map(before.obligations.filter(row=>row.title==="please fix").map(row=>[row.id,row]));
 const afterRows=new Map(after.obligations.filter(row=>row.title==="please fix").map(row=>[row.id,row]));
 if(beforeRows.size!==afterRows.size||[...beforeRows].some(([id,row])=>JSON.stringify(row)!==JSON.stringify(afterRows.get(id))))throw Error("Work please fix requests in Family constitution → please fix so assignment, clause review and evidence stay linked.");
}
export function assignPleaseFix(store:Store,profile:string,persona:string|null,id:string,owner:RepairOwner){
 if(repairRole(persona)!=="patriarch")throw Error("Only the Patriarch assigns a repair request.");
 if(!validRepairOwner(owner))throw Error("Assign an Associate or Family technician.");
 const key=operationsKey(profile),raw=store.getItem(key);if(!raw)throw Error("Request not found.");
 const data=decodeOperations(raw),row=data.obligations.find(item=>item.id===id&&item.title==="please fix");if(!row||row.status!=="Open")throw Error("Choose an open repair request.");
 const finding=findingFor(store,profile,row.source),reviewKey=officeReviewKey(profile),reviewRaw=store.getItem(reviewKey),state=reviewRaw?officeReviewSchema.parse(JSON.parse(reviewRaw)):initialOfficeReview;
 const next=decodeOperations(JSON.stringify({...data,obligations:data.obligations.map(item=>item.id===id?{...item,owner:normalRepairOwner(owner),workflowId:`office-review:${finding.id}`,notes:`${item.notes}\n${new Date().toISOString()} · Patriarch assigned to ${owner} against current clause\n${finding.detail}`} : item)}));
 const reviewed=officeReviewSchema.parse({...state,reviews:[...state.reviews.filter(item=>item.findingId!==finding.id),{findingId:finding.id,owner:normalRepairOwner(owner),evidence:"Patriarch assignment against current clause",actionId:row.id,reviewedAt:new Date().toISOString(),observedFingerprint:findingFingerprint(finding)}]});
 try{store.setItem(key,JSON.stringify(next));store.setItem(reviewKey,JSON.stringify(reviewed));}catch(error){store.setItem(key,raw);reviewRaw===null?store.removeItem(reviewKey):store.setItem(reviewKey,reviewRaw);throw error;}return next;
}
export function updatePleaseFix(store:Store,profile:string,persona:string|null,id:string,action:"accept"|"resolve"|"reopen",evidence:string){
 const key=operationsKey(profile),raw=store.getItem(key);if(!raw)throw Error("Request not found.");const data=decodeOperations(raw),row=data.obligations.find(item=>item.id===id&&item.title==="please fix");if(!row)throw Error("Request not found.");
 const role=repairRole(persona),assigned=role===normalRepairOwner(row.owner);
 if(action==="reopen"?role!=="patriarch"&&!assigned:!assigned)throw Error("Only the assigned Associate or Family technician can work this request.");
 if(action!=="reopen"&&row.status!=="Open")throw Error("Reopen the request before working on it.");
 if(action==="resolve"&&!evidence.trim())throw Error("Record the corrected instrument, revision and completion evidence.");
 if(action==="resolve"&&!row.workflowId?.startsWith("office-review:sources-legality-"))throw Error("Ask the Patriarch to assign this earlier request against its current saved clause before resolving it.");
 if(action==="resolve"&&row.workflowId?.startsWith("office-review:sources-legality-")){
  const sourceId=row.workflowId.slice("office-review:sources-legality-".length),current=findingFor(store,profile,sourceId),reviewRaw=store.getItem(officeReviewKey(profile)),review=reviewRaw?officeReviewSchema.parse(JSON.parse(reviewRaw)).reviews.find(item=>item.actionId===id):null;
  // A changed clause needs a fresh reviewed request before its legal repair is closed.
  if(review?.observedFingerprint!==findingFingerprint(current))throw Error("The clause or constitution revision changed. Ask the Patriarch to reopen and reissue this request against the current clause.");
 }
 const progress=action==="accept"?25:action==="resolve"?100:0;
 const next=decodeOperations(JSON.stringify({...data,obligations:data.obligations.map(item=>item.id===id?{...item,owner:normalRepairOwner(item.owner),status:action==="resolve"?"Complete":"Open",evidence:action==="resolve"?evidence.trim():action==="reopen"?"":item.evidence,task:{project:"Constitution legality",priority:"High",progress,startDate:dateOnly()<row.due?dateOnly():row.due},notes:`${item.notes}\n${new Date().toISOString()} · ${role} · ${action}${evidence.trim()?` · ${evidence.trim()}`:""}`} : item)}));
 store.setItem(key,JSON.stringify(next));return next;
}
