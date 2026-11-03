import { expect, it } from "vitest";
import { goldenBirdEnglishCase, goldenBirdFx, inrToGbp } from "./golden-bird-adaptation";
import { goldenBirdModules, goldenBirdProfileId, ensureGoldenBirdCase, constitutionCheckDefaults } from "./golden-bird-case";
import { evaluateDistribution, evaluateReservedDecision, goldenBirdTraceCurrent } from "./golden-bird-rules";
import { caseKey, exportCase, importCase } from "./case-model";
import { sourceKey } from "./source-model";
import { consolidateBook } from "./finance-book-model";
import { calculateIht } from "./estate-iht-model";
import { fullBoardReport } from "./operations-report";

const memory = () => {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); } };
};

it("populates one exportable GBP case with reconciled accounts and operational estate inputs", () => {
  const modules = goldenBirdModules();
  expect(modules.governance.people.reduce((n,p)=>n+p.ownership,0)).toBe(100);
  expect(modules.sources.sources).toHaveLength(41);
  expect(modules.sources.sources.every(s=>s.status==="reviewed")).toBe(true);
  expect(consolidateBook(modules.book).errors).toEqual([]);
  expect(calculateIht(modules["statutory-estate"]).totalTax).toBeGreaterThan(0);
  const store = memory(); ensureGoldenBirdCase(store, goldenBirdProfileId);
  const backup = exportCase(store, goldenBirdProfileId);
  importCase(JSON.stringify(backup), store, "restored");
  expect(JSON.parse(store.getItem(caseKey("restored"))!).currency).toBe("GBP");
  const report=fullBoardReport(store,goldenBirdProfileId).markdown;
  expect(report).toContain("Constitutional cash distribution");
  expect(report).toContain("Reserved decision review");
});

it("preserves saved case edits and leaves other profiles untouched", () => {
  const store = memory();
  ensureGoldenBirdCase(store, "other"); expect(store.values.size).toBe(0);
  ensureGoldenBirdCase(store, goldenBirdProfileId);
  const key=caseKey(goldenBirdProfileId), saved=JSON.parse(store.getItem(key)!);
  store.setItem(key,JSON.stringify({...saved,family:"Edited family"}));
  ensureGoldenBirdCase(store,goldenBirdProfileId);
  expect(JSON.parse(store.getItem(key)!).family).toBe("Edited family");
});

it("rolls back sample initialization when storage rejects a write", () => {
  const store=memory(); let failed=false;
  const failing={...store,setItem:(key:string,value:string)=>{if(key===sourceKey(goldenBirdProfileId)&&!failed){failed=true;throw new Error("quota");}store.setItem(key,value);}};
  expect(()=>ensureGoldenBirdCase(failing,goldenBirdProfileId)).toThrow("quota");
  expect(store.values.size).toBe(0);
});

it("uses one dated INR-per-pound conversion for subscriptions", () => {
  expect(inrToGbp(goldenBirdFx.inrPerGbp)).toBe(1);
  expect(goldenBirdEnglishCase.capital.seedFundingGbp).toBeCloseTo(757575.757575,4);
  expect(goldenBirdEnglishCase.owners.reduce((n,o)=>n+o.subscriptionGbp,0)).toBeCloseTo(goldenBirdEnglishCase.capital.seedFundingGbp,8);
});

it("funds the safeguards before allocating remaining cash and enforces profit capacity", () => {
  const result=evaluateDistribution(constitutionCheckDefaults.distribution);
  expect(result.operatingTarget).toBe(72000);
  expect(result.distributableCash).toBe(168000);
  expect(result.allocations.permittedDividends).toBe(50400);
  expect(evaluateDistribution({...constitutionCheckDefaults.distribution,distributableProfitCapacity:50000}).blockers).toContain("The dividend budget exceeds profits lawfully available for distribution.");
  expect(evaluateDistribution({...constitutionCheckDefaults.distribution,covenantClear:false}).distributableCash).toBe(0);
});

it("uses eligible disinterested rights and does not lower thresholds through absence", () => {
  const baseline=constitutionCheckDefaults.vote;
  expect(evaluateReservedDecision(baseline).passed).toBe(true);
  const conflict={...baseline,owners:baseline.owners.map(o=>({...o,eligible:o.id!=="F",supports:o.id==="A1"}))};
  const reviewed=evaluateReservedDecision(conflict);
  expect(reviewed.eligibleRights).toBe(40);
  expect(reviewed.ownerPercent).toBe(62.5);
  expect(reviewed.passed).toBe(false);
  expect(evaluateReservedDecision({...baseline,boardRecommending:3}).checks.board).toBe(false);
  expect(evaluateReservedDecision({...baseline,owners:baseline.owners.map(o=>({...o,present:o.id==="F"}))}).passed).toBe(false);
});

it("invalidates a constitutional binding when the adopted clause changes", () => {
  const store=memory();ensureGoldenBirdCase(store,goldenBirdProfileId);
  expect(goldenBirdTraceCurrent(store,goldenBirdProfileId,"GB-ART7-DISTRIBUTIONS")).toBe(true);
  const key=sourceKey(goldenBirdProfileId),pack=JSON.parse(store.getItem(key)!);
  pack.sources.find((s:{id:string})=>s.id==="GB-ART7-DISTRIBUTIONS").excerpt="Changed rule";
  store.setItem(key,JSON.stringify(pack));
  expect(goldenBirdTraceCurrent(store,goldenBirdProfileId,"GB-ART7-DISTRIBUTIONS")).toBe(false);
});
