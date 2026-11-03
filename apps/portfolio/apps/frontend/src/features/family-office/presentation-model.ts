import { financeDefaults, financeSchema, financeStorageKey, financials, type FinanceInput } from "./finance-model";
import { governanceKey, governanceSchema, initialGovernance } from "./governance-model";
import { estateKey, estateSchema, initialEstate } from "./estate-model";
import { simulationDefaults, simulationSchema } from "./simulation-model";
import { decodeOperations, initialOperations, operationsKey } from "./operations-model";
import { loadSources } from "./source-model";

export function loadPresentation(store: Pick<Storage,"getItem">, profile: string) {
  const read = <T,>(key: string, fallback: T, parse: (value: unknown)=>T): T => {
    const raw=store.getItem(key); return raw === null ? fallback : parse(JSON.parse(raw));
  };
  const finance=read(financeStorageKey(),financeDefaults,v=>financeSchema.parse(v));
  const governance=read(governanceKey(profile),initialGovernance(),v=>governanceSchema.parse(v));
  const estate=read(estateKey(profile),initialEstate(),v=>estateSchema.parse(v));
  const simulation=read(`profile:${profile}:family-office:simulation:1`,simulationDefaults,v=>simulationSchema.parse(v));
  const operationsRaw=store.getItem(operationsKey(profile));
  return { finance, governance, estate, simulation,
    operations: operationsRaw === null ? initialOperations() : decodeOperations(operationsRaw),
    sources:loadSources(store,profile).sources };
}

export function wealthComposition(input: FinanceInput, publicEquityShock: number) {
  if (!Number.isFinite(publicEquityShock) || publicEquityShock < -100 || publicEquityShock > 100) throw new Error("Invalid public-equity shock");
  const f=financials(input);
  const rows=[{name:"Operating business",value:f.familyBusiness},{name:"Public equities",value:input.equities*(1+publicEquityShock/100)},{name:"Fixed income",value:input.bonds},{name:"Property",value:input.property},{name:"Cash",value:input.cash}];
  const total=rows.reduce((sum,row)=>sum+row.value,0);
  return {rows,total,change:total-f.aum,concentration:total>0?f.familyBusiness/total*100:0};
}
