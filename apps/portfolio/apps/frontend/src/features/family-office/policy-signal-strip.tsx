import "./policy-dashboard.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { selectedProfileId } from "@/features/profiles/session";
import { useScenario } from "./finance-ui";
import { investmentDefaults, investmentSchema } from "./investment-model";
import { readEffectivePolicy } from "./policy-engine";
import { policyDashboardSignals } from "./policy-dashboard";
export function PolicySignalStrip() {
 const id=selectedProfileId()??"static-demo",state=useScenario(`profile:${id}:family-office:investment:1`,investmentSchema,investmentDefaults),[,refresh]=useState(0);
 useEffect(()=>{const update=()=>refresh(n=>n+1);window.addEventListener("familybizness:record-updated",update);return()=>window.removeEventListener("familybizness:record-updated",update);},[]);
 let policy=null,error="";try{policy=readEffectivePolicy(localStorage,id);}catch(e){error=String(e);}
 const signals=policyDashboardSignals(policy,state.value,error);
 return <section className="policy-dashboard" aria-label="Policy traffic-light dashboard"><div className="policy-dashboard-head"><h2>Investment mandate · {new Intl.NumberFormat("en-GB",{style:"currency",currency:state.value.currency,maximumFractionDigits:0}).format(state.value.initial)} sleeve</h2><Link to="/office/policy">Policy revision {policy?.revision??"—"} ↗</Link></div><ul>{signals.map(s=><li key={s.id} data-policy-light={s.light}><span className="policy-dashboard-light" aria-hidden="true"/><div><span className="policy-dashboard-label">{s.label}</span><strong>{s.observed}</strong><span className="policy-dashboard-state">{s.state}</span><span className="policy-dashboard-limit">{s.requirement}</span></div></li>)}</ul><p className="sr-only">Green is within mandate. Amber means near the existing limit or review/data required. Red means the current policy limit is breached. Amber proximity is an early-warning display, not a new enforced rule.</p></section>;
}
