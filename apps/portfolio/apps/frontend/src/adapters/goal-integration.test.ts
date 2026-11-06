import {it,expect} from "vitest";
import {invoke} from "./web/core";
import {getDemoStore} from "./static-store";
import {goalCommitments} from "@/features/goals/goal-ledger";
import type {Goal,GoalPlan} from "@/lib/types";
it("persists one edit and publishes the same goals to expenditure and spending",async()=>{
 const goals=await invoke<Goal[]>("get_goals"); const goal=goals[0];
 let events=0;const handler=()=>events++;window.addEventListener("familybizness:record-updated",handler);
 const saved=await invoke<Goal>("update_goal",{goal:{...goal,targetAmount:100,summaryCurrentValue:150}});
 const dashboard=await invoke<Goal[]>("get_goals");
 expect(dashboard.find(g=>g.id===goal.id)).toEqual(saved);
 expect(goalCommitments(dashboard)).toEqual(goalCommitments(getDemoStore().goals));
 expect(saved.summaryTargetAmount).toBe(100);expect(saved.summaryProgress).toBe(1);expect(events).toBe(1);
 await invoke("save_goal_plan",{plan:{goalId:goal.id,planKind:"save_up",settingsJson:"{}"}});
 const plan=await invoke<GoalPlan>("get_goal_plan",{goalId:goal.id});expect(plan.settingsJson).toBe("{}");
 const overview=await invoke<{targetAmount:number;currentValue:number}>("get_save_up_overview",{goalId:goal.id});expect(overview.targetAmount).toBe(100);expect(overview.currentValue).toBe(150);
 window.removeEventListener("familybizness:record-updated",handler);
});
