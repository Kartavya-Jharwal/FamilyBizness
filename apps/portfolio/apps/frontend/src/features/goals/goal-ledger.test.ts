import { describe,it,expect } from "vitest";
import { normaliseGoal,goalCommitments,previewSavings } from "./goal-ledger";
import { SAMPLE_GOALS } from "@/adapters/demo-family";
describe("shared goal ledger",()=>{
 it("uses the goal planner decimal annual return convention",()=>{const p=previewSavings({currentValue:100,targetAmount:200,targetDate:"2027-01-01",monthlyContribution:0,expectedAnnualReturn:.12},new Date("2026-01-01"));expect(p.projectedValueAtTargetDate).toBeCloseTo(112);});
 it("replaces stale summary targets when a goal is edited",()=>{const original=SAMPLE_GOALS[0];const changed=normaliseGoal({...original,targetAmount:100,summaryCurrentValue:150});expect(changed.summaryTargetAmount).toBe(100);expect(changed.summaryProgress).toBe(1);expect(changed.statusHealth).toBe("on_track");expect(goalCommitments([changed])).toEqual({target:100,funded:150,remaining:0});});
 it("projects a zero-return funded target without a false shortfall",()=>{const p=previewSavings({currentValue:120,targetAmount:100,targetDate:"2027-01-01",monthlyContribution:0,expectedAnnualReturn:0},new Date("2026-01-01"));expect(p.projectedValueAtTargetDate).toBe(120);expect(p.health).toBe("on_track");expect(p.requiredMonthlyContribution).toBe(0);});
});
