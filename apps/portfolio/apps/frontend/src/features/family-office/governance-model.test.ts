import { describe, expect, it } from "vitest";
import { governanceSchema, initialGovernance, successionScenario, transitionDecision } from "./governance-model";

describe("governance and succession", () => {
  it("preserves economic and voting totals independently without mutating current ownership", () => {
    const current = initialGovernance();
    const next = successionScenario(current.people, "founder", "successor", 30, 10);
    expect(next.find(p=>p.id === "successor")).toMatchObject({ownership:55,voting:35});
    expect(current.people[0].ownership).toBe(60);
    expect(next.reduce((sum,p)=>sum+p.ownership,0)).toBe(100);
    expect(next.reduce((sum,p)=>sum+p.voting,0)).toBe(100);
  });
  it("rejects invalid totals, duplicate identities and excess or negative transfers", () => {
    const input=initialGovernance();
    expect(()=>successionScenario(input.people,"founder","successor",61,0)).toThrow();
    expect(()=>successionScenario(input.people,"founder","founder",1,1)).toThrow();
    expect(()=>successionScenario(input.people,"founder","successor",-1,1)).toThrow();
    expect(()=>successionScenario(input.people,"founder","successor",NaN,1)).toThrow();
    expect(()=>governanceSchema.parse({...input, people:input.people.map(p=>({...p,ownership:20}))})).toThrow();
    expect(()=>governanceSchema.parse({...input, people:input.people.map(p=>({...p,id:"duplicate"}))})).toThrow();
  });
  it("requires the right RACI participant, stage and reason and retains authority evidence", () => {
    const input=initialGovernance();
    input.decisions=[{id:"d1",title:"Investment decision",ruleId:"investment",status:"draft",note:"",amount:0,currency:"GBP",approvals:[],history:[]}];
    const time="2026-11-02T10:00:00.000Z";
    expect(()=>transitionDecision(input,"d1","approved","founder","Reviewed",time)).toThrow();
    expect(()=>transitionDecision(input,"d1","submitted","founder","Reviewed",time)).toThrow();
    expect(()=>transitionDecision(input,"d1","submitted","steward","",time)).toThrow();
    const submitted=transitionDecision(input,"d1","submitted","steward","Prepared evidence",time);
    const approved=transitionDecision(submitted,"d1","approved","founder","Reviewed evidence",time);
    expect(approved.decisions[0].status).toBe("approved");
    expect(approved.decisions[0].history.join(" ")).toContain(input.rules[0].source);
    expect(()=>transitionDecision(approved,"d1","rejected","founder","Late rejection",time)).toThrow();
  });
  it("validates recorded succession before/after snapshots", () => {
    const input=initialGovernance();
    const event={id:"s1",at:"2026-11-02T10:00:00.000Z",description:"Retirement",from:"founder",to:"successor",ownership:30,voting:30,before:input.people,after:successionScenario(input.people,"founder","successor",30,30),source:input.source};
    expect(governanceSchema.parse({...input,successionEvents:[event]}).successionEvents).toHaveLength(1);
    expect(()=>governanceSchema.parse({...input,successionEvents:[{...event,after:input.people}]})).toThrow();
  });
});
