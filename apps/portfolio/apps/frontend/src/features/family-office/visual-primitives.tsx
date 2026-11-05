import { useState } from "react";
import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent, cardSurfaceClassName } from "@fb/ui";
import { Link } from "react-router-dom";
export const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
export const shortMoney = (n: number) => Math.abs(n) >= 1e6 ? `GBP ${(n / 1e6).toFixed(2)}m` : gbp(n);
const chartEdgeSpace = typeof document === "undefined" ? 0 : Number(getComputedStyle(document.documentElement).getPropertyValue("--design-chart-edge-space"));
export const chartEdgePadding = { left: chartEdgeSpace, right: chartEdgeSpace };
export const chartTooltip = { background: "var(--popover)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--control-radius)", boxShadow: "var(--popup-shadow)" };
export function VisualPanel({ title, action, to, children }: {
    title: string;
    action?: string;
    to?: string;
    children: ReactNode;
}) { return <Card className="fo-panel min-w-0"><CardHeader className="fo-panel-header"><CardTitle><h2>{title}</h2></CardTitle>{to && <Link className="fo-panel-action" to={to}>{action ?? "View details"}<span aria-hidden="true"> ↗</span></Link>}</CardHeader><CardContent>{children}</CardContent></Card>; }

export function Stat({ label, value, detail }: {
    label: string;
    value: string;
    detail?: string;
}) { return <Card className="fo-metric min-w-0"><p className="fo-metric-label">{label}</p><p className="fo-metric-value">{value}</p>{detail && <p className="fo-metric-detail">{detail}</p>}</Card>; }

export function DetailPanel({ title, children }: {
    title: string;
    children: ReactNode;
}) { const [open, setOpen] = useState(false); return <details className={`${cardSurfaceClassName} fo-disclosure`} onToggle={event => setOpen(event.currentTarget.open)}><summary className="cursor-pointer font-medium">{title}</summary>{open && <div className="mt-5">{children}</div>}</details>; }
