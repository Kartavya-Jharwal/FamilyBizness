import {describe,it,expect} from "vitest";
import {fullBoardReport,linkedWorkflowObligations,savedSnapshot} from "./operations-report";
import {initialGovernance,governanceKey} from "./governance-model";
import {financeDefaults} from "./finance-model";
import {initialServices,serviceCosts} from "./operations-service-model";
const store=(values:Record<string,string>)=>({getItem:(key:string)=>values[key]??null});
describe("board reporting and operating model",()=>{
 it("never turns missing or malformed sources into default approved financials",()=>{
  const report=fullBoardReport(store({}),"demo","2026-11-02T12:00:00Z");expect(report.markdown).toContain("No saved input");expect(report.markdown).not.toContain("Consolidated planning financials");
  const damaged=fullBoardReport(store({"profile:demo:family-office:finance:1":"{"}),"demo");expect(damaged.snapshot.owners.finance.status).toBe("invalid");
  expect(savedSnapshot(store({}),"x",v=>v).status).toBe("missing");
 });
 it("retains financial source and generates deduplicated decision tasks",()=>{
  const g=initialGovernance();g.decisions=[{id:"review-1",title:"Review investment",ruleId:"investment",status:"submitted",note:"Check",amount:0,currency:"GBP",approvals:[],history:[]}];
  const data=store({[governanceKey("demo")]:JSON.stringify(g),"profile:demo:family-office:finance:1":JSON.stringify(financeDefaults)});
  const one=linkedWorkflowObligations({version:1,obligations:[]},data,"demo","2026-11-09");expect(one.obligations).toHaveLength(1);expect(one.obligations[0].workflowId).toBe("review-1");
  one.obligations[0].status="Complete";one.obligations[0].evidence="Board minutes";
  const twice=linkedWorkflowObligations(one,data,"demo","2026-11-10");expect(twice.obligations).toHaveLength(1);expect(twice.obligations[0].evidence).toBe("Board minutes");
  expect(fullBoardReport(data,"demo").markdown).toContain(financeDefaults.source);
 });
 it("compares equivalent operating scope, setup once and basis-point fees correctly",()=>{
  const p={...initialServices,years:2,inflation:0,aumGrowth:0,taxPercent:0};const costs=serviceCosts(p,10000000);
  expect(costs[0].sfo).toBe(295000);expect(costs[1].sfo).toBe(265000);
  expect(costs[0].mfo).toBe(145000);expect(costs[1].mfo).toBe(135000);
  expect(()=>serviceCosts(p,NaN)).toThrow();
 });
});
