import { Link } from "react-router-dom";
import { charterPriorities, familyOfficeSources } from "./family-office-constitution";

const charterArticles = familyOfficeSources.filter(source => source.id.startsWith("FO-") && source.id !== "FO-IPS-MANDATE");

export function FamilyCharterOverview() {
  return <section className="space-y-5" aria-label="Smith Family Constitution">
    <div className="rounded-xl border bg-card p-5 text-card-foreground"><p className="text-sm text-muted-foreground">Smith Family Constitution · one family office · GBP</p><h2 className="mt-2 text-2xl font-semibold">The Smith family charter</h2><p className="mt-3 max-w-3xl text-muted-foreground">One constitution for the Smith family enterprise: craftsmanship, continuity and stewardship across generations. These articles already feed the office's checks, responsibilities, calendar and planning records.</p></div>
    <div className="grid gap-4 md:grid-cols-2">{charterPriorities.map(item => <article key={item.source} className="rounded-lg border bg-card p-5 text-card-foreground"><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-muted-foreground">{item.text}</p><p className="mt-3 text-xs text-muted-foreground">{item.sourceLabel}</p><Link className="mt-4 inline-block text-sm font-medium underline" to={item.route}>{item.action} →</Link></article>)}</div>
    <details className="rounded-lg border p-4"><summary className="cursor-pointer font-medium">Constitution articles</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">{charterArticles.map(source => <article key={source.id}><h3 className="font-medium">{source.section}</h3><p className="mt-1 text-sm text-muted-foreground">{source.parameter}</p></article>)}</div><p className="mt-4 text-sm text-muted-foreground">This is the Smith Family Constitution, one family policy. Article traces keep the selection rationale. Original family identities, ownership totals and business accounts stay separate.</p></details>
  </section>;
}
