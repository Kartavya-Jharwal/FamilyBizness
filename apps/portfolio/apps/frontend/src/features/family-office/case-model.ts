import { officeReviewKey, officeReviewSchema } from "./office-review-model";
import { constitutionRegistryKey, constitutionRegistrySchema } from "./constitution-pack-model";
import { z } from "zod";
import { governanceSchema,governanceKey } from "./governance-model";
import { estateSchema,estateKey } from "./estate-model";
import { financeSchema } from "./finance-model";
import { simulationSchema } from "./simulation-model";
import { SourcePackSchema,sourceKey } from "./source-model";
import { readEffectivePolicy,policyKey } from "./policy-engine";
import { ihtSchema,ihtKey } from "./estate-iht-model";
import { financeBookSchema } from "./finance-book-model";
import { investmentSchema } from "./investment-model";
import { performanceSchema } from "./investment-performance";
import { decodeOperations,operationsKey } from "./operations-model";
import { servicesSchema,servicesKey } from "./operations-service-model";
import { capitalSchema,capitalKey } from "./operations-capital";
import { distributionInputSchema, voteInputSchema } from "./golden-bird-rules";

export const caseSchema=z.object({schema:z.literal(1),family:z.string().trim().min(1).max(200),business:z.string().trim().min(1).max(200),description:z.string().trim().min(1).max(4000),basis:z.enum(["single-assignment","composite-assignment","hypothetical"]),sourceAssignments:z.string().max(2000),currency:z.enum(["GBP","USD","EUR"]),asOf:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),preparedBy:z.string().trim().min(1).max(300)});
export type FamilyCase=z.infer<typeof caseSchema>;
export const caseKey=(profile:string)=>`profile:${profile}:family-case:v1`;
export const caseDefaults:FamilyCase={schema:1,family:"Illustrative family",business:"Illustrative operating company",description:"Hypothetical planning case. Replace with the team's selected family context and reviewed source excerpts.",basis:"hypothetical",sourceAssignments:"Not yet selected",currency:"GBP",asOf:"2026-11-02",preparedBy:"Project team"};
export const caseModules=[
  {id:"office-review",name:"Stewardship findings & source links",route:"/office/review",key:officeReviewKey,schema:officeReviewSchema},
  {id:"constitutions",name:"Constitution library & active rule parameters",route:"/office/business?tab=constitution",key:constitutionRegistryKey,schema:constitutionRegistrySchema},
  {id:"constitution-distribution",name:"Constitution cash waterfall",route:"/office/business?tab=constitution",key:(p:string)=>`profile:${p}:constitution-distribution:v1`,schema:distributionInputSchema},
  {id:"constitution-vote",name:"Constitution reserved decision review",route:"/office/business?tab=constitution",key:(p:string)=>`profile:${p}:constitution-vote:v1`,schema:voteInputSchema},
  {id:"case",name:"Family case",route:"/office/case",key:caseKey,schema:caseSchema},
  {id:"governance",name:"Participants & decisions",route:"/office/governance",key:governanceKey,schema:governanceSchema},
  {id:"sources",name:"Constitution excerpts",route:"/office/sources",key:sourceKey,schema:SourcePackSchema},
  {id:"book",name:"Entity financial statements & forecasts",route:"/office/finance",key:(p:string)=>`profile:${p}:family-office:book:1`,schema:financeBookSchema},
  {id:"statutory-estate",name:"Statutory estate & trust scenario",route:"/office/estate",key:ihtKey,schema:ihtSchema},
  {id:"investments",name:"Security allocations & constraints",route:"/office/simulation",key:(p:string)=>`profile:${p}:family-office:investment:1`,schema:investmentSchema},
  {id:"performance",name:"Monthly performance records",route:"/office/simulation",key:(p:string)=>`profile:${p}:family-office:performance:1`,schema:performanceSchema},
  {id:"operations",name:"Obligations & recurrence",route:"/office",key:operationsKey,schema:z.unknown().transform(v=>decodeOperations(JSON.stringify(v)))},
  {id:"services",name:"Service providers & costs",route:"/office",key:servicesKey,schema:servicesSchema},
  {id:"capital",name:"Grant & venture commitments",route:"/office/philanthropy",key:capitalKey,schema:capitalSchema},
  {id:"finance",name:"Legacy financial worksheet (optional archive)",route:"/office/finance",key:(p:string)=>`profile:${p}:family-office:finance:1`,schema:financeSchema},
  {id:"estate",name:"Legacy estate stress (optional archive)",route:"/office/estate",key:estateKey,schema:estateSchema},
  {id:"simulation",name:"Legacy scenario worksheet (optional archive)",route:"/office/simulation",key:(p:string)=>`profile:${p}:family-office:simulation:1`,schema:simulationSchema},
];
type Store=Pick<Storage,"getItem"|"setItem"|"removeItem">;
export function inspectCase(store:Pick<Storage,"getItem">,profile:string){return caseModules.map(m=>{const raw=store.getItem(m.key(profile));if(raw===null)return {id:m.id,name:m.name,route:m.route,status:"not-saved" as const,detail:"No saved case data; module may display labelled examples."};try{m.schema.parse(JSON.parse(raw));return {id:m.id,name:m.name,route:m.route,status:"valid" as const,detail:"Saved inputs pass schema validation. Source accuracy still requires team review."};}catch(e){return {id:m.id,name:m.name,route:m.route,status:"invalid" as const,detail:String(e)};}});}
const BackupSchema=z.object({schema:z.literal(1),exportedAt:z.string().datetime(),modules:z.record(z.string(),z.unknown()),policy:z.unknown().nullable()});
export function exportCase(store:Pick<Storage,"getItem">,profile:string){const modules:Record<string,unknown>={};for(const m of caseModules){const raw=store.getItem(m.key(profile));if(raw!==null)modules[m.id]=m.schema.parse(JSON.parse(raw));}const policy=readEffectivePolicy(store,profile);return BackupSchema.parse({schema:1,exportedAt:new Date().toISOString(),modules,policy});}
export function prepareCaseImport(raw:string,store:Pick<Storage,"getItem">,profile:string){
  const pack=BackupSchema.parse(JSON.parse(raw));const writes=new Map<string,string>();
  for(const [id,data] of Object.entries(pack.modules)){const module=caseModules.find(m=>m.id===id);if(!module)throw new Error(`Unknown case module: ${id}`);writes.set(module.key(profile),JSON.stringify(module.schema.parse(data)));}
  if(pack.policy!==null)writes.set(policyKey(profile),JSON.stringify(pack.policy));
  const virtual={getItem:(key:string)=>writes.get(key)??store.getItem(key)};
  readEffectivePolicy(virtual,profile); // Validate source references before any write.
  return {writes,names:Object.keys(pack.modules),hasPolicy:pack.policy!==null};
}
export function importCase(raw:string,store:Store,profile:string){
  const plan=prepareCaseImport(raw,store,profile),before=new Map<string,string|null>();
  for(const key of plan.writes.keys())before.set(key,store.getItem(key));
  try{for(const [key,value] of plan.writes)store.setItem(key,value);}catch(e){for(const [key,value] of before){if(value===null)store.removeItem(key);else store.setItem(key,value);}throw e;}
  return plan.names;
}
