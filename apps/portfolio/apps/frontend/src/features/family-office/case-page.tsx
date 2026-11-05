import { Link } from "react-router-dom";
import { selectedProfileId } from "@/features/profiles/session";
import { useProfile } from "@/features/profiles/profile-context";
import { FamilyOfficeShell } from "./family-office-shell";
import { useOfficeCapital, CapitalStats, CapitalAllocation, LiquidityVisual } from "./capital-workspace";
import { VisualPanel } from "./visual-primitives";
import { decodeOperations, operationsKey, dateOnly } from "./operations-model";
import { readEffectivePolicy } from "./policy-engine";
export default function CasePage() {
    const state = useOfficeCapital(), profile = useProfile(), id = selectedProfileId() ?? "static-demo";
    let tasks: ReturnType<typeof decodeOperations>["obligations"] = [];
    try {
        tasks = decodeOperations(localStorage.getItem(operationsKey(id)) ?? '{"version":1,"obligations":[]}').obligations;
    }
    catch { }
    const meetings = tasks.filter(t => t.meeting && t.status === "Open" && t.due >= dateOnly()).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3), actions = tasks.filter(t => !t.meeting && t.status === "Open").sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
    let count = 0;
    try {
        count = readEffectivePolicy(localStorage, id)?.rules.length ?? 0;
    }
    catch { }
    return <FamilyOfficeShell title="Stewardship"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Welcome, {profile?.profile?.name ?? "family office"} - {state.value.asOf}</p><Link to="/office/policy" className="rounded-full bg-muted px-4 py-2 text-sm">{count} investment rules active</Link></div><CapitalStats book={state.value}/><div className="grid gap-5 lg:grid-cols-3"><CapitalAllocation book={state.value}/><div className="lg:col-span-2"><LiquidityVisual book={state.value}/></div></div><div className="grid gap-5 lg:grid-cols-2"><VisualPanel title="Next family meetings" to="/office" action="Open calendar"><div className="space-y-3">{meetings.map(t => <Link key={t.id} to="/office" className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted"><div className="rounded-md bg-muted px-3 py-2 text-center"><span className="block text-xs">{new Date(t.due + 'T12:00:00').toLocaleDateString('en-GB', { month: 'short' })}</span><strong className="text-xl">{t.due.slice(8)}</strong></div><div><h3 className="font-medium">{t.title}</h3><p className="mt-1 text-sm text-muted-foreground">{t.meeting?.start} - {t.meeting?.attendees.length} participants</p></div><span className="ml-auto" aria-hidden="true">&#8594;</span></Link>)}</div></VisualPanel><VisualPanel title="Decisions and responsibilities" to="/office/business" action="Open work queue"><div className="space-y-3">{actions.map(t => <Link key={t.id} to={t.sourceRoute || "/office/business"} className="block rounded-lg border p-3 hover:bg-muted"><div className="flex justify-between gap-3"><h3 className="text-sm font-medium">{t.title}</h3><span className="shrink-0 text-xs text-muted-foreground">{t.due.slice(5)}</span></div><p className="mt-2 text-xs text-muted-foreground">{t.owner}</p></Link>)}</div></VisualPanel></div><div className="grid gap-3 sm:grid-cols-3">{[["Business valuation", "DCF and earnings multiples", "/office/finance"], ["Portfolio outlook", "Allocation and Monte Carlo", "/office/simulation"], ["Succession funding", "Estate liabilities and liquidity", "/office/estate"]].map(([title, sub, to]) => <Link key={to} to={to} className="rounded-xl border p-5 hover:bg-muted"><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{sub} &#8594;</p></Link>)}</div></FamilyOfficeShell>;
}
