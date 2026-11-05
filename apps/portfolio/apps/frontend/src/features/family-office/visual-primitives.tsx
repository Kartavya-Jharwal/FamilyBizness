import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
export const gbp = (n: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
export const shortMoney = (n: number) => Math.abs(n) >= 1e6 ? `GBP ${(n / 1e6).toFixed(2)}m` : gbp(n);
export const chartTooltip = { background: "var(--background)", color: "var(--foreground)", border: "1px solid var(--border)", borderRadius: "var(--radius)" };
export function VisualPanel({ title, action, to, children }: {
    title: string;
    action?: string;
    to?: string;
    children: ReactNode;
}) { return <section className="min-w-0 rounded-xl border bg-card p-5 text-card-foreground"><header className="mb-5 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">{title}</h2>{to && <Link className="text-sm underline underline-offset-4" to={to}>{action ?? "View details"}</Link>}</header>{children}</section>; }
export function Stat({ label, value, detail }: {
    label: string;
    value: string;
    detail?: string;
}) { return <div className="min-w-0 rounded-xl border bg-card p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 break-words text-2xl font-semibold tracking-tight">{value}</p>{detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}</div>; }
export function DetailPanel({ title, children }: {
    title: string;
    children: ReactNode;
}) { const [open, setOpen] = useState(false); return <details className="rounded-xl border p-5" onToggle={event => setOpen(event.currentTarget.open)}><summary className="cursor-pointer font-medium">{title}</summary>{open && <div className="mt-5">{children}</div>}</details>; }
