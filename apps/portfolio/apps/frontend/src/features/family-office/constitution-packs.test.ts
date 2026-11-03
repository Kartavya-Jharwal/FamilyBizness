import { expect, it } from "vitest";
import { activeConstitution, constitutionPackSchema, constitutionRegistryKey, constitutionTraceCurrent, goldenBirdConstitutionPack, readConstitutionRegistry, writeConstitutionRegistry, type ConstitutionPack } from "./constitution-pack-model";
import { constitutionCheckDefaults } from "./golden-bird-case";
import { evaluateDistribution, evaluateReservedDecision } from "./golden-bird-rules";
import { sourceKey } from "./source-model";
import { createFamilyCase } from "./case-setup";
import { caseKey, exportCase, importCase } from "./case-model";

function memory(){const values=new Map<string,string>();return {values,getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};}
function anotherPack():ConstitutionPack {
  const p=structuredClone(goldenBirdConstitutionPack),ids={distribution:"RIVER-CASH",reservedVoting:"RIVER-VOTE"};
  return constitutionPackSchema.parse({...p,id:"river",name:"River family constitution",parameters:{...p.parameters,sourceIds:ids,reservedOwnerPercent:50,reservedBoardFraction:{numerator:1,denominator:2},distributableCashAllocationPercent:{coreReinvestmentAndReserves:50,permittedDividends:40,ringFencedGrowth:10}},sources:[{...p.sources.find(s=>s.id===p.parameters.sourceIds.distribution)!,id:ids.distribution,excerpt:"Allocate remaining cash 50/40/10 after funding safeguards."},{...p.sources.find(s=>s.id===p.parameters.sourceIds.reservedVoting)!,id:ids.reservedVoting,excerpt:"Require 50% of eligible owner rights and half the Board."}]});
}
it("does not apply Golden Bird to an independent case without an adopted constitution",()=>{
  const store=memory();expect(activeConstitution(store,"new-family")).toBeNull();expect(readConstitutionRegistry(store,"new-family").packs).toEqual([]);
});
it("switches between two constitutions and evaluates each pack's actual parameters",()=>{
  const store=memory(),river=anotherPack();
  writeConstitutionRegistry(store,"p",{schema:1,activePackId:goldenBirdConstitutionPack.id,packs:[goldenBirdConstitutionPack,river]});
  expect(evaluateDistribution(constitutionCheckDefaults.distribution,activeConstitution(store,"p")!.parameters).allocations.permittedDividends).toBe(50400);
  writeConstitutionRegistry(store,"p",{...readConstitutionRegistry(store,"p"),activePackId:river.id});
  const active=activeConstitution(store,"p")!;
  expect(evaluateDistribution(constitutionCheckDefaults.distribution,active.parameters).allocations.permittedDividends).toBe(67200);
  const vote={...constitutionCheckDefaults.vote,boardRecommending:3,owners:constitutionCheckDefaults.vote.owners.map(o=>({...o,supports:o.id==="F"}))};
  expect(evaluateReservedDecision(vote,active.parameters).passed).toBe(true);
  expect(evaluateReservedDecision(vote,goldenBirdConstitutionPack.parameters).passed).toBe(false);
  expect(constitutionTraceCurrent(store,"p",river.parameters.sourceIds.distribution)).toBe(true);
});
it("invalidates edited source bindings and preserves other family libraries",()=>{
  const store=memory(),river=anotherPack();writeConstitutionRegistry(store,"a",{schema:1,activePackId:river.id,packs:[river]});writeConstitutionRegistry(store,"b",{schema:1,activePackId:goldenBirdConstitutionPack.id,packs:[goldenBirdConstitutionPack]});
  const source=JSON.parse(store.getItem(sourceKey("a"))!);source.sources[0].excerpt="Changed";store.setItem(sourceKey("a"),JSON.stringify(source));
  expect(constitutionTraceCurrent(store,"a",river.parameters.sourceIds.distribution)).toBe(false);
  expect(constitutionTraceCurrent(store,"b",goldenBirdConstitutionPack.parameters.sourceIds.distribution)).toBe(true);
});
it("rolls back registry changes when the associated source write fails",()=>{
  const store=memory();let rejected=false;
  const failing={...store,setItem:(k:string,v:string)=>{if(k===sourceKey("p")&&!rejected){rejected=true;throw new Error("quota");}store.setItem(k,v);}};
  expect(()=>writeConstitutionRegistry(failing,"p",{schema:1,activePackId:goldenBirdConstitutionPack.id,packs:[goldenBirdConstitutionPack]})).toThrow("quota");
  expect(store.getItem(constitutionRegistryKey("p"))).toBeNull();
});
it("creates a named blank family and round-trips all constitution versions",async()=>{
  const store=memory();await createFamilyCase(store,"family-new","River family","River Ltd","blank",[{id:"family-new",name:"River family",avatarId:"default",lockEnabled:false}]);
  expect(JSON.parse(store.getItem(caseKey("family-new"))!).business).toBe("River Ltd");expect(activeConstitution(store,"family-new")).toBeNull();
  const river=anotherPack();writeConstitutionRegistry(store,"family-new",{schema:1,activePackId:river.id,packs:[goldenBirdConstitutionPack,river]});
  importCase(JSON.stringify(exportCase(store,"family-new")),store,"restored");expect(readConstitutionRegistry(store,"restored").packs).toHaveLength(2);expect(activeConstitution(store,"restored")!.id).toBe(river.id);
});
it("rejects invalid allocation totals and missing source evidence before adoption",()=>{
  const p=anotherPack();expect(()=>constitutionPackSchema.parse({...p,parameters:{...p.parameters,distributableCashAllocationPercent:{coreReinvestmentAndReserves:90,permittedDividends:40,ringFencedGrowth:10}}})).toThrow();expect(()=>constitutionPackSchema.parse({...p,sources:[]})).toThrow();
});
