import { caseDefaults, caseModules, prepareCaseImport } from "./case-model";
import { emptyConstitutionRegistry } from "./constitution-pack-model";
import type { ProfileSummary } from "@/features/profiles/api";

type Store=Pick<Storage,"getItem"|"setItem"|"removeItem">;
export async function createFamilyCase(store:Store,profile:string,name:string,business:string,template:"blank"|"golden-bird",profiles:ProfileSummary[]) {
  if(caseModules.some(m=>store.getItem(m.key(profile))!==null))throw new Error("This case already contains saved data; choose a new profile.");
  const modules:Record<string,unknown>=template==="golden-bird"?(await import("./golden-bird-case")).goldenBirdModules():{constitutions:emptyConstitutionRegistry,sources:{schema:1,sources:[]}};
  const identity=template==="golden-bird"?modules.case as typeof caseDefaults:caseDefaults;
  modules.case={...identity,family:name.trim(),business:business.trim()||`${name.trim()} business`,
    description:template==="golden-bird"?"Independent family case started from the Golden Bird assignment example. Edit the case records and constitution to suit this family.":"Independent family case. Add family participants, financial records and a constitution using the existing workspaces.",
    asOf:new Date().toISOString().slice(0,10),sourceAssignments:template==="golden-bird"?identity.sourceAssignments:"Family constitution not yet selected",preparedBy:"Family office"};
  if(template==="golden-bird"){
    const governance=modules.governance as Record<string,unknown>;
    modules.governance={...governance,family:name.trim(),business:(modules.case as typeof caseDefaults).business};
  }
  const plan=prepareCaseImport(JSON.stringify({schema:1,exportedAt:new Date().toISOString(),modules,policy:null}),store,profile);
  plan.writes.set("familybizness:demo-profiles",JSON.stringify(profiles));
  const before=new Map([...plan.writes.keys()].map(key=>[key,store.getItem(key)]));
  try{for(const [key,value] of plan.writes)store.setItem(key,value);}catch(e){for(const [key,value] of before)value===null?store.removeItem(key):store.setItem(key,value);throw e;}
}
