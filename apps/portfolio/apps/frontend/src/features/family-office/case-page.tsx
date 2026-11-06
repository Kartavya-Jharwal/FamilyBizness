import {FamilyNameField} from "./family-name";
import { cardSurfaceClassName } from "@fb/ui";
import { Link } from "react-router-dom";
import { selectedProfileId } from "@/features/profiles/session";
import "./family-office.css";
import PortfolioPage from "@/pages/dashboard/portfolio-page";
import { PolicySignalStrip } from "./policy-signal-strip";
import { useEffect, useReducer } from "react";
import { VisualPanel } from "./visual-primitives";
import { decodeOperations, operationsKey, dateOnly } from "./operations-model";
export default function CasePage() {
    const id = selectedProfileId() ?? "static-demo";
    const [,refresh] = useReducer(n=>n+1,0);
    useEffect(()=>{const update=(event:Event)=>{const key=event instanceof StorageEvent?event.key:(event as CustomEvent).detail?.key;if(key===operationsKey(id))refresh();};window.addEventListener("familybizness:record-updated",update);window.addEventListener("storage",update);return()=>{window.removeEventListener("familybizness:record-updated",update);window.removeEventListener("storage",update);};},[id]);
    let tasks: ReturnType<typeof decodeOperations>["obligations"] = [];
    try {
        tasks = decodeOperations(localStorage.getItem(operationsKey(id)) ?? '{"version":1,"obligations":[]}').obligations;
    }
    catch { }
    const meetings = tasks.filter(t => t.meeting && t.status === "Open" && t.due >= dateOnly()).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3), actions = tasks.filter(t => !t.meeting && t.status === "Open").sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
    return <section className="family-overview h-full min-h-0"><h1 className="sr-only">Stewardship</h1><FamilyNameField/><PortfolioPage policySummary={<PolicySignalStrip/>} officeWidgets={<><nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Family financial workspaces">{[["Allocations", "Asset mix and family capital", "/office/simulation?tab=allocation"], ["Family FIRE", "Spending across generations", "/office/simulation?tab=fire"], ["X-ray & risk", "Liquidity, scenarios and stress", "/office/simulation?tab=xray"], ["Financial sheets", "Balance sheet, income and cash flow", "/office/finance"]].map(([title,sub,to])=><Link key={to} to={to} className={`${cardSurfaceClassName} fo-route-tile`}><h2 className="font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{sub} ↗</p></Link>)}</nav><div className="grid gap-5 lg:grid-cols-2"><VisualPanel title="Next family meetings" to="/office" action="Open calendar"><div className="space-y-3">{meetings.map(t=><Link className="block rounded-(--control-radius) border p-3" key={t.id} to="/office"><h3 className="font-medium">{t.title}</h3><p className="mt-1 text-sm text-muted-foreground">{t.due} · {t.meeting?.start} · {t.meeting?.attendees.length} participants</p></Link>)}</div></VisualPanel><VisualPanel title="Decisions and responsibilities" to="/office/business" action="Open work queue"><div className="space-y-3">{actions.map(t=><Link key={t.id} className="block rounded-(--control-radius) border p-3" to={t.sourceRoute||"/office/business"}><h3 className="text-sm font-medium">{t.title}</h3><p className="mt-1 text-xs text-muted-foreground">{t.owner} · {t.due}</p></Link>)}</div></VisualPanel></div></>}/></section>;
}
