import { useMemo, useState, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { FamilyAllocations, FamilyFire, FamilyXray, ReturnMethods } from "./family-analysis-workspaces";
import { Button, Tabs, TabsContent } from "@fb/ui";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/office-charts";
import { selectedProfileId } from "@/features/profiles/session";
import { useScenario, NumberField } from "./finance-ui";
import { investmentSchema, investmentDefaults, portfolioStats, optimiseSecurities, projectSecurities, bindInvestmentPolicy } from "./investment-model";
import { readEffectivePolicy } from "./policy-engine";
import { FamilyOfficeShell } from "./family-office-shell";
import { DetailPanel, VisualPanel, Stat, gbp, shortMoney, chartTooltip, chartEdgePadding } from "./visual-primitives";
const Workbench = lazy(() => import("./investment-workspace"));
export function PortfolioVisual({ compact = false }: {
    compact?: boolean;
}) {
    const id = selectedProfileId() ?? "static-demo", state = useScenario(`profile:${id}:family-office:investment:1`, investmentSchema, investmentDefaults), p = state.value;
    const [weights, setWeights] = useState<number[] | null>(null), [solution, setSolution] = useState<ReturnType<typeof optimiseSecurities> | null>(null), [error, setError] = useState("");
    const w = weights ?? p.securities.map(s => s.current / 100), stats = portfolioStats(p, w);
    const projection = useMemo(() => projectSecurities(p, w), [p, weights]);
    const data = projection.series.map(r => ({ ...r, range: [r.p10, r.p90] }));
    const allocation = p.securities.map((s, i) => ({ name: s.name, current: s.current, proposed: w[i] * 100 }));
    function optimise() { try {
        const policy = readEffectivePolicy(localStorage, id), input = bindInvestmentPolicy(p, policy), s = optimiseSecurities(input);
        setSolution(s);
        setWeights(s.best?.weights ?? null);
        setError(s.best ? "" : s.reason);
    }
    catch (e) {
        setError(String(e));
    } }
    return <div className="space-y-5"><div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Stat label="Investment capital" value={shortMoney(p.initial)}/><Stat label="Expected annual return" value={`${stats.expected.toFixed(2)}%`} detail={`Target ${p.target}%`}/><Stat label="Annual volatility" value={`${stats.volatility.toFixed(2)}%`} detail={`Risk limit ${p.riskMax}%`}/><Stat label="Reserve survival" value={`${(projection.reserveSuccess * 100).toFixed(0)}%`} detail={`${p.paths} paths over ${p.years} years`}/></div>
 <VisualPanel title="Monte Carlo - spending across generations" to={compact ? "/office/simulation" : undefined} action="Explore scenarios"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">10th to 90th percentile range and median capital</p><span className="rounded-full bg-muted px-3 py-1 text-xs">{weights ? "Policy-constrained allocation" : "Current allocation"}</span></div><div className={compact ? "mt-4 h-64" : "mt-4 h-80"}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis padding={chartEdgePadding} tick={{ fill: "var(--muted-foreground)" }} dataKey="year" tickFormatter={v => `Y${v}`}/><YAxis tick={{ fill: "var(--muted-foreground)" }} width={65} tickFormatter={v => `${(Number(v) / 1e6).toFixed(0)}m`}/><Tooltip formatter={(v, name) => [Array.isArray(v) ? v.map(n => shortMoney(Number(n))).join(" - ") : gbp(Number(v)), name]} contentStyle={chartTooltip}/><Legend formatter={value => <span className="text-foreground">{value}</span>}/><Area isAnimationActive={false} name="10th-90th percentile" dataKey="range" stroke="none" fill="var(--chart-1)" fillOpacity={.2}/><Line isAnimationActive={false} name="Median capital" dataKey="median" stroke="var(--chart-5)" strokeWidth={3} dot={false}/></AreaChart></ResponsiveContainer></div>{!compact && <div className="grid gap-4 sm:grid-cols-3"><NumberField label="Annual family spending (GBP)" value={p.spend} onChange={spend => { state.update({ ...p, spend }); setWeights(null); }}/><NumberField label="Protected reserve (GBP)" value={p.reserve} onChange={reserve => state.update({ ...p, reserve })}/><div className="rounded-md bg-muted p-3 text-sm"><span className="block text-muted-foreground">Liquidity failure probability</span><strong className="mt-1 block text-xl">{(projection.liquidityFailure * 100).toFixed(1)}%</strong></div></div>}</VisualPanel>
 {!compact && <><div className="grid gap-5 lg:grid-cols-2"><VisualPanel title="Current and optimal allocation"><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={allocation} layout="vertical"><XAxis padding={chartEdgePadding} tick={{ fill: "var(--muted-foreground)" }} type="number" domain={[0, 100]} tickFormatter={v => `${v}%`}/><YAxis tick={{ fill: "var(--muted-foreground)" }} type="category" dataKey="name" width={125}/><Tooltip formatter={v => `${Number(v).toFixed(1)}%`} contentStyle={chartTooltip}/><Legend formatter={value => <span className="text-foreground">{value}</span>}/><Bar isAnimationActive={false} name="Current" dataKey="current" fill="var(--chart-2)"/><Bar isAnimationActive={false} name="Proposed" dataKey="proposed" fill="var(--chart-1)"/></BarChart></ResponsiveContainer></div><Button onClick={optimise}>Optimise within IPS limits</Button>{solution?.best && <p role="status" className="mt-3 text-sm">{solution.status === "optimal" ? "Target met within policy limits" : "Best feasible allocation; target needs review"} - {solution.best.expected.toFixed(2)}% expected return.</p>}{error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}</VisualPanel><VisualPanel title="Portfolio mechanics"><div className="space-y-4">{p.securities.map((s, i) => <div key={s.id}><div className="mb-1 flex justify-between text-sm"><span>{s.name}</span><strong>{(w[i] * 100).toFixed(1)}%</strong></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full" style={{ width: `${w[i] * 100}%`, background: `var(--chart-${i + 1})` }}/></div><p className="mt-1 text-xs text-muted-foreground">{s.liquid ? "Liquid" : "Private / restricted liquidity"} - fee {s.fee}% - return assumption {s.expected}%</p></div>)}</div></VisualPanel></div><DetailPanel title="Deep analysis - correlations, stress, returns and source inputs"><Suspense fallback={<p>Opening portfolio analysis...</p>}><Workbench /></Suspense></DetailPanel></>}
 </div>;
}
export default function PortfolioPage() {
    const [params,setParams]=useSearchParams(),requested=params.get("tab"),tab=["portfolio","allocation","fire","xray","methods"].includes(requested??"")?requested!:"portfolio";
    return <FamilyOfficeShell title="Portfolio & scenarios"><Tabs value={tab} onValueChange={value=>setParams({tab:String(value)})}><TabsContent value="portfolio"><PortfolioVisual/></TabsContent><TabsContent value="allocation"><FamilyAllocations/></TabsContent><TabsContent value="fire"><FamilyFire/></TabsContent><TabsContent value="xray"><FamilyXray/><ReturnMethods/></TabsContent><TabsContent value="methods"><ReturnMethods/></TabsContent></Tabs></FamilyOfficeShell>;
}
