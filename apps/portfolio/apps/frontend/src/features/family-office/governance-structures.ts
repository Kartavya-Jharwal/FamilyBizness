import { z } from "zod";
const text=z.string().trim().min(1).max(500);
export const entitySchema=z.object({id:text,name:text,type:z.enum(["operating-company","holding-company","trust","personal"]),source:text,owners:z.array(z.object({ownerId:text,economic:z.number().min(0).max(100),votes:z.number().min(0).max(100)})).min(1).max(40)});
export type OwnershipEntity=z.infer<typeof entitySchema>;
export const continuitySchema=z.object({id:text,title:text,ownerId:text,successorId:text,trigger:z.enum(["retirement","incapacity","death","ongoing"]),status:z.enum(["pending","in-progress","complete"]),evidence:z.string().max(2000),source:text,dueDate:z.string().refine(v=>v==="" || (/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v),"Use a valid due date").default(""),dependsOn:z.array(text).max(30),required:z.boolean()});
export type ContinuityAction=z.infer<typeof continuitySchema>;
export function validateEntities(entities:OwnershipEntity[],peopleIds:string[]) {
  const ids=entities.map(e=>e.id);
  if(new Set([...ids,...peopleIds]).size!==ids.length+peopleIds.length)throw new Error("Entity and person IDs must be unique across the ownership graph");
  for(const e of entities){
    if(new Set(e.owners.map(o=>o.ownerId)).size!==e.owners.length)throw new Error("Each entity needs unique owners");
    if(e.owners.some(o=>![...ids,...peopleIds].includes(o.ownerId)))throw new Error("Ownership references an unknown owner");
    for(const k of ["economic","votes"] as const)if(Math.abs(e.owners.reduce((s,o)=>s+o[k],0)-100)>.001)throw new Error(`${e.name}: ${k} rights must total 100%`);
  }
  const visit=(id:string,path:Set<string>)=>{if(path.has(id))throw new Error("Circular ownership is unsupported; remove the cycle");const e=entities.find(n=>n.id===id);if(e)e.owners.forEach(o=>visit(o.ownerId,new Set([...path,id])));};
  ids.forEach(id=>visit(id,new Set()));
}
export function economicInterest(entities:OwnershipEntity[],entityId:string,personId:string):number {
  const entity=entities.find(e=>e.id===entityId);if(!entity)return entityId===personId?100:0;
  return entity.owners.reduce((sum,o)=>sum+o.economic/100*economicInterest(entities,o.ownerId,personId),0);
}
export function controlledVotes(entities:OwnershipEntity[],entityId:string,personId:string):number {
  const entity=entities.find(e=>e.id===entityId);if(!entity)return entityId===personId?100:0;
  return entity.owners.reduce((sum,o)=>sum+(o.ownerId===personId || (entities.some(e=>e.id===o.ownerId)&&controlledVotes(entities,o.ownerId,personId)>50)?o.votes:0),0);
}
export function updateContinuity(actions:ContinuityAction[],id:string,status:ContinuityAction["status"],evidence:string) {
  const item=actions.find(a=>a.id===id);if(!item)throw new Error("Continuity action not found");
  if(status==="complete"&&(!evidence.trim()||item.dependsOn.some(dep=>actions.find(a=>a.id===dep)?.status!=="complete")))throw new Error("Complete prerequisites and record evidence before marking ready");
  if(status!=="complete"&&actions.some(a=>a.status==="complete"&&a.dependsOn.includes(id)))throw new Error("Reopen dependent completed actions first");
  return actions.map(a=>a.id===id?{...a,status,evidence}:a);
}
