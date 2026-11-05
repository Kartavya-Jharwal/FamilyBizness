import { expect, it } from "vitest";
import { investmentDefaults } from "./investment-model";
import { policyDashboardSignals } from "./policy-dashboard";
import { ensureFamilyOfficeCase } from "./family-office-case";
import { familyOfficeCaseId } from "./family-office-constitution";
import { readEffectivePolicy } from "./policy-engine";
it("uses the current policy for red breaches, amber headroom and green pass signals", () => {
 localStorage.clear();ensureFamilyOfficeCase(localStorage);
 const policy=readEffectivePolicy(localStorage,familyOfficeCaseId)!,p=structuredClone(investmentDefaults);p.reserve=800000;
 let signals=policyDashboardSignals(policy,p);
 expect(signals.find(s=>s.id===policy.rules.find(r=>r.kind==="cash-minimum")!.id)?.light).toBe("amber");
 expect(signals.find(s=>s.id===policy.rules.find(r=>r.kind==="equity-maximum")!.id)?.light).toBe("green");
 p.securities.find(s=>s.kind==="cash")!.current=0;
 signals=policyDashboardSignals(policy,p);
 expect(signals.find(s=>s.id===policy.rules.find(r=>r.kind==="cash-minimum")!.id)?.light).toBe("red");
 expect(policyDashboardSignals(policy,p,"Source changed").every(s=>s.light==="amber")).toBe(true);
 expect(policyDashboardSignals(null,p)[0].state).toBe("Review required");
});
