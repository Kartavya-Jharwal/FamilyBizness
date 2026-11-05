import { investmentPolicyFacts } from "./policy-dashboard";
import { cardSurfaceClassName } from "@fb/ui";
import { IpsAdoptionPanel } from "./ips-adoption-panel";
import { PolicyWorkspace } from "./policy-page";
import { activeConstitution } from "./constitution-pack-model";
import { useState } from "react";
import { Link } from "react-router-dom";
import { selectedProfileId } from "@/features/profiles/session";
import { parseConstitution } from "@/features/governance/constitution/policy";
import { loadWorkspace, workspaceKey } from "@/features/governance/constitution/workspace";
import { readEffectivePolicy, evaluateRules } from "./policy-engine";
import { investmentSchema, investmentDefaults } from "./investment-model";
import { distributionInputSchema, evaluateDistribution } from "./golden-bird-rules";
import { VisualPanel, Stat, gbp, shortMoney } from "./visual-primitives";
import { FamilyOfficeShell } from "./family-office-shell";
export function IpsVisual() {
    const id = selectedProfileId() ?? "static-demo";
    const [expanded, setExpanded] = useState(false);
    const [revision, setRevision] = useState(0);
    let policy = null;
    let message = "";
    try {
        policy = readEffectivePolicy(localStorage, id);
    }
    catch (e) {
        message = String(e);
    }
    const raw = localStorage.getItem(`profile:${id}:family-office:investment:1`), p = raw ? investmentSchema.parse(JSON.parse(raw)) : investmentDefaults;
    const facts = investmentPolicyFacts(p);
    const findings = evaluateRules(policy, facts, ["cash-minimum", "equity-maximum", "illiquid-maximum", "reserve-minimum", "excluded-sector"]);
    const labels: Record<string, string> = { "cash-minimum": "Keep investment cash available", "equity-maximum": "Limit public-equity exposure", "illiquid-maximum": "Cap illiquid commitments", "reserve-minimum": "Protect succession liquidity", "excluded-sector": "Apply the values screen", "approval-threshold": "Obtain independent approval" };
    const donor = loadWorkspace(localStorage, workspaceKey(id)), parsed = parseConstitution(donor.content);
    let allocation = { coreReinvestmentAndReserves: 0, permittedDividends: 0, ringFencedGrowth: 0 };
    let cash: ReturnType<typeof evaluateDistribution> | null = null;
    try {
        const pack = activeConstitution(localStorage, id), raw = localStorage.getItem(`profile:${id}:constitution-distribution:v1`);
        if (pack && raw) {
            cash = evaluateDistribution(distributionInputSchema.parse(JSON.parse(raw)), pack.parameters);
            allocation = pack.parameters.distributableCashAllocationPercent;
        }
    }
    catch { }
    return <div className="space-y-5" data-policy-revision={revision}><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-muted-foreground">Family investment policy</p><h2 className="mt-1 text-2xl font-semibold">Clear instructions. Enforced limits.</h2></div><Link to="/office/constitution" className="text-sm underline">Family constitution & source clauses</Link></div>{message && <p role="alert">{message}</p>}
 <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{policy?.rules.map(rule => { const result = findings.find(f => f.ruleId === rule.id); const limit = rule.kind === "excluded-sector" ? rule.text : rule.kind === "approval-threshold" ? `${gbp(rule.value)} / ${rule.text} reviewers` : rule.kind === "reserve-minimum" ? shortMoney(rule.value) : `${rule.kind === "cash-minimum" ? "At least" : "At most"} ${rule.value}%`; return <article key={rule.id} className={`${cardSurfaceClassName} fo-policy-card`}><p className="text-sm text-muted-foreground">{labels[rule.kind]}</p><h3 className="mt-2 text-xl font-semibold">{limit}</h3><div className="mt-4 flex items-center gap-2 text-sm"><span className={`size-2 rounded-full ${result?.status === "breach" ? "bg-destructive" : result?.status === "pass" ? "bg-success" : "bg-muted-foreground"}`}/>{result ? result.status === "pass" ? "Within mandate" : `Needs attention - ${result.observed}` : "Checked on each commitment"}</div></article>; })}</div>
 <p className="text-sm text-muted-foreground">Mandate revision {policy?.revision ?? "—"}{policy && ` · Adopted ${new Date(policy.activatedAt).toLocaleDateString("en-GB")} by ${policy.reviewer}`} · Constitution revision {activeConstitution(localStorage,id)?.revision ?? "—"}</p>
 {cash && <VisualPanel title="Cash distribution mandate"><div className="mb-4 grid gap-3 sm:grid-cols-3"><Stat label="Available after safeguards" value={shortMoney(cash.distributableCash)}/><Stat label="Permitted owner distributions" value={shortMoney(cash.allocations.permittedDividends)}/><Stat label="Funded obligations and reserves" value={shortMoney(cash.committedCash)}/></div><div className="flex h-14 overflow-hidden rounded-lg text-sm font-medium">{[["Core", allocation.coreReinvestmentAndReserves, 1], ["Dividends", allocation.permittedDividends, 2], ["Growth", allocation.ringFencedGrowth, 3]].map(([name, value, color]) => <div key={name} className="flex items-center justify-center text-foreground" style={{ width: `${value}%`, background: `color-mix(in srgb, var(--chart-${color}) 40%, var(--card))` }}>{name} {value}%</div>)}</div>{cash.blockers.length > 0 && <p className="mt-3 text-sm text-destructive">{cash.blockers.join(" ")}</p>}</VisualPanel>}
 <details className={`${cardSurfaceClassName} fo-disclosure`} open={expanded} onToggle={e => setExpanded(e.currentTarget.open)}><summary className="cursor-pointer font-medium">Natural-language statement and donor policy inspector</summary><pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-7">{donor.content}</pre><div className="mt-4 grid gap-3 sm:grid-cols-3">{parsed.gates.filter(g => g.recognitionStatus === "executable").slice(0, 3).map(g => <div key={g.id} className="rounded-md bg-muted p-3 text-sm"><p className="font-medium">{g.assetClass ?? g.field}</p><p className="mt-2">{g.comparator} {g.threshold}%</p><p className="mt-2 text-xs text-muted-foreground">Parsed from source line {g.sourceLine}</p></div>)}</div></details>
 <details className={`${cardSurfaceClassName} fo-disclosure`} open={new URLSearchParams(location.hash.split("?")[1]).get("edit")==="1" || undefined}><summary className="cursor-pointer font-medium">Revise and date the investment policy statement</summary><div className="mt-5"><IpsAdoptionPanel onAdopt={()=>setRevision(value=>value+1)}/></div></details><details className={`${cardSurfaceClassName} fo-disclosure`}><summary className="cursor-pointer font-medium">Hard-rule configuration</summary><div className="mt-5"><PolicyWorkspace/></div></details>
 </div>;
}
export default function IpsPage() { return <FamilyOfficeShell title="Investment mandate"><IpsVisual /></FamilyOfficeShell>; }
