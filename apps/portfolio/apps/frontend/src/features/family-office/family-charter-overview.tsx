import { Link } from "react-router-dom";
import { charterPriorities, constitutionDonors } from "./family-office-constitution";

export function FamilyCharterOverview() {
  return <section className="space-y-5" aria-label="Combined family operating charter">
    <div className="rounded-xl border bg-card p-5 text-card-foreground"><p className="text-sm text-muted-foreground">Four constitutions · one family office · GBP</p><h2 className="mt-2 text-2xl font-semibold">A charter built around the family's decisions</h2><p className="mt-3 max-w-3xl text-muted-foreground">Business continuity, orderly ownership liquidity and stewardship across generations. The selected provisions already feed the office's checks, responsibilities, calendar and planning records.</p></div>
    <div className="grid gap-4 md:grid-cols-2">{charterPriorities.map(item => <article key={item.source} className="rounded-lg border bg-card p-5 text-card-foreground"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.text}</p><p className="mt-3 text-xs text-muted-foreground">{item.sourceLabel}</p><Link className="mt-4 inline-block text-sm font-medium underline" to={item.route}>{item.action} →</Link></article>)}</div>
    <details className="rounded-lg border p-4"><summary className="cursor-pointer font-medium">Where the selected provisions came from</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">{constitutionDonors.map(source => <article key={source.id}><h3 className="font-medium">{source.name}</h3><p className="mt-1 text-sm text-muted-foreground">{source.selected}</p></article>)}</div><p className="mt-4 text-sm text-muted-foreground">One operating model is selected where the documents differ. Original family identities, ownership totals and business accounts are not combined. Source clauses retain the selection rationale.</p></details>
  </section>;
}
