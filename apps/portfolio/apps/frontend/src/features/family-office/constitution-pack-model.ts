import { z } from "zod";
import { goldenBirdEnglishCase } from "./golden-bird-adaptation";
import { SourcePackSchema, sourceKey, loadSources } from "./source-model";

const percent = z.number().finite().min(0).max(100);
export const constitutionParametersSchema = z.object({
  distributionDebtFundingMonths: z.number().int().min(1).max(120),
  distributionFixedCostReserveMonths: z.number().int().min(0).max(120),
  flagshipAuditedComplianceYears: z.number().int().min(0).max(100),
  distributableCashAllocationPercent: z.object({ coreReinvestmentAndReserves: percent, permittedDividends: percent, ringFencedGrowth: percent }),
  reservedOwnerPercent: percent,
  quorumEligibleVoterPercent: percent,
  reservedBoardFraction: z.object({ numerator: z.number().int().min(1).max(40), denominator: z.number().int().min(1).max(40) }),
  requireOutsideLargestBranch: z.boolean(),
  sourceIds: z.object({ distribution: z.string().trim().min(1), reservedVoting: z.string().trim().min(1) }),
}).superRefine((p, c) => {
  if (Math.abs(Object.values(p.distributableCashAllocationPercent).reduce((n,v)=>n+v,0)-100)>1e-6) c.addIssue({ code: "custom", message: "Cash allocation percentages must total 100%." });
  if(p.sourceIds.distribution===p.sourceIds.reservedVoting)c.addIssue({code:"custom",message:"Use separate source IDs for cash and decision clauses."});
  if (p.reservedBoardFraction.numerator > p.reservedBoardFraction.denominator) c.addIssue({ code: "custom", message: "Board recommendation fraction cannot exceed one." });
});
export type ConstitutionParameters = z.infer<typeof constitutionParametersSchema>;
export const constitutionPackSchema = z.object({
  id: z.string().trim().min(1).max(100), name: z.string().trim().min(1).max(200),
  description: z.string().max(2000), currency: z.enum(["GBP", "USD", "EUR"]),
  revision: z.number().int().positive(), reviewer: z.string().trim().min(1).max(200),
  adoptedAt: z.string().datetime(), parameters: constitutionParametersSchema,
  sources: SourcePackSchema.shape.sources,
}).superRefine((p,c)=>{
  if(!SourcePackSchema.safeParse({schema:1,sources:p.sources}).success)c.addIssue({code:"custom",message:"Constitution sources must be valid and uniquely identified."});
  for (const id of Object.values(p.parameters.sourceIds)) if(!p.sources.some(s=>s.id===id&&s.status==="reviewed")) c.addIssue({code:"custom",message:`Reviewed source ${id} is required.`});
});
export type ConstitutionPack = z.infer<typeof constitutionPackSchema>;
export const constitutionRegistrySchema = z.object({ schema: z.literal(1), activePackId: z.string().nullable(), packs: z.array(constitutionPackSchema).max(30) }).superRefine((r,c)=>{
  if(new Set(r.packs.map(p=>p.id)).size!==r.packs.length)c.addIssue({code:"custom",message:"Constitution IDs must be unique."});
  if(r.activePackId!==null&&!r.packs.some(p=>p.id===r.activePackId))c.addIssue({code:"custom",message:"Active constitution is missing."});
});
export type ConstitutionRegistry = z.infer<typeof constitutionRegistrySchema>;
export const constitutionRegistryKey=(profile:string)=>`profile:${profile}:constitutions:v1`;
export const emptyConstitutionRegistry: ConstitutionRegistry={schema:1,activePackId:null,packs:[]};
export const goldenBirdConstitutionPack = constitutionPackSchema.parse({
  id:"golden-bird",name:goldenBirdEnglishCase.identity.title,description:"Selectable English-law assignment example",currency:"GBP",revision:1,
  reviewer:"Golden Bird fictional case specification",adoptedAt:"2026-11-03T00:00:00.000Z",
  parameters:{...goldenBirdEnglishCase.parameters,requireOutsideLargestBranch:true},sources:goldenBirdEnglishCase.clauses,
});

export function readConstitutionRegistry(store:Pick<Storage,"getItem">,profile:string):ConstitutionRegistry {
  const raw=store.getItem(constitutionRegistryKey(profile));
  if(raw!==null)return constitutionRegistrySchema.parse(JSON.parse(raw));
  // Migrate an explicitly imported earlier Golden Bird source pack, not arbitrary families.
  const sources=loadSources(store,profile).sources;
  const matches=Object.values(goldenBirdConstitutionPack.parameters.sourceIds).every(id=>{
    const expected=goldenBirdConstitutionPack.sources.find(s=>s.id===id);
    return sources.some(s=>s.id===id&&s.status==="reviewed"&&s.excerpt===expected?.excerpt&&s.interpretation===expected.interpretation);
  });
  return matches?{schema:1,activePackId:goldenBirdConstitutionPack.id,packs:[goldenBirdConstitutionPack]}:emptyConstitutionRegistry;
}
export function activeConstitution(store:Pick<Storage,"getItem">,profile:string):ConstitutionPack|null {
  const registry=readConstitutionRegistry(store,profile);
  return registry.packs.find(p=>p.id===registry.activePackId)??null;
}
export function constitutionTraceCurrent(store:Pick<Storage,"getItem">,profile:string,id:string):boolean {
  try {
    const pack=activeConstitution(store,profile),expected=pack?.sources.find(s=>s.id===id),actual=loadSources(store,profile).sources.find(s=>s.id===id);
    return !!expected&&!!actual&&actual.status==="reviewed"&&actual.excerpt===expected.excerpt&&actual.interpretation===expected.interpretation;
  }catch{return false;}
}
export function writeConstitutionRegistry(store:Pick<Storage,"getItem"|"setItem"|"removeItem">,profile:string,value:unknown) {
  const registry=constitutionRegistrySchema.parse(value),active=registry.packs.find(p=>p.id===registry.activePackId);
  const writes=new Map([[constitutionRegistryKey(profile),JSON.stringify(registry)]]);
  if(active)writes.set(sourceKey(profile),JSON.stringify(SourcePackSchema.parse({schema:1,sources:active.sources})));
  const before=new Map([...writes.keys()].map(key=>[key,store.getItem(key)]));
  try{for(const [key,data] of writes)store.setItem(key,data);}catch(e){for(const [key,data] of before)data===null?store.removeItem(key):store.setItem(key,data);throw e;}
  return registry;
}
