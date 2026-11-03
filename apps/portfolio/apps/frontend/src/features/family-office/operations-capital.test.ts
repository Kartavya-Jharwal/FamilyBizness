import { describe,it,expect } from "vitest";
import { financeDefaults } from "./finance-model";
import { initialGovernance } from "./governance-model";
import { capitalSchema,capitalTotals,initialCapital,proposeCapital,transitionCapital,recordCapitalPayment,type CapitalRecord } from "./operations-capital";
const at="2026-11-02T12:00:00.000Z";
const request:CapitalRecord={id:"grant-1",title:"Education fund",kind:"Grant",year:2026,recipient:"Education charity",owner:"steward",requested:50000,source:"A1 section 3",purpose:"Bursaries",diligence:"Charity registration and beneficiary eligibility reviewed",status:"Draft",decisionId:"",ruleId:"",history:[]};
describe("capital commitments and evidenced payments",()=>{
 it("requires diligence, responsible submission, approved linked decision and available budget",()=>{
  let data={...initialCapital(),records:[request]};const governance=initialGovernance();
  expect(()=>proposeCapital(data,"grant-1",governance,"distribution","steward","Evidence",at)).toThrow(/diligence/i);
  data=transitionCapital(data,"grant-1","Diligence","steward","Start review",at,financeDefaults,governance);
  expect(()=>proposeCapital(data,"grant-1",governance,"distribution","successor","Evidence",at)).toThrow(/responsible/i);
  const submitted=proposeCapital(data,"grant-1",governance,"distribution","steward","Review complete",at);
  expect(()=>transitionCapital(submitted.capital,"grant-1","Approved","founder","Approve",at,financeDefaults,submitted.governance)).toThrow(/Governance/i);
  const approvedGovernance={...submitted.governance,decisions:submitted.governance.decisions.map(d=>({...d,status:"approved" as const}))};
  expect(()=>transitionCapital(submitted.capital,"grant-1","Approved","founder","Approve",at,{...financeDefaults,philanthropy:10000},approvedGovernance)).toThrow(/budget/i);
  const approved=transitionCapital(submitted.capital,"grant-1","Approved","founder","Approve",at,financeDefaults,approvedGovernance);
  expect(capitalTotals(approved,"Grant",2026).committed).toBe(50000);
 });
 it("records partial payments/refunds without overpayment, duplicate IDs or erasing approval",()=>{
  const data={...initialCapital(),records:[{...request,status:"Approved" as const,decisionId:"capital:grant-1",ruleId:"distribution"}]};
  const payment={id:"payment-1",recordId:"grant-1",date:"2026-11-02",amount:20000,reference:"bank-123",evidence:"Statement evidence",recordedBy:"steward",kind:"Payment" as const};
  const paid=recordCapitalPayment(data,payment);expect(capitalTotals(paid,"Grant",2026)).toMatchObject({committed:50000,paid:20000,outstanding:30000});
  expect(()=>recordCapitalPayment(paid,payment)).toThrow();
  expect(()=>recordCapitalPayment(paid,{...payment,id:"overpay",reference:"bank-overpay",amount:40000})).toThrow(/overpay/i);
  expect(()=>recordCapitalPayment(paid,{...payment,id:"refund",reference:"bank-refund",kind:"Refund",amount:30000})).toThrow(/refund/i);
  const refunded=recordCapitalPayment(paid,{...payment,id:"refund",reference:"bank-refund",kind:"Refund",amount:5000});expect(capitalTotals(refunded,"Grant",2026).paid).toBe(15000);
  expect(()=>transitionCapital(paid,"grant-1","Cancelled","steward","Cancel",at,financeDefaults,initialGovernance())).toThrow(/erased/i);
  expect(()=>capitalSchema.parse({...paid,payments:[{...payment,evidence:""}]})).toThrow();
 });
});

