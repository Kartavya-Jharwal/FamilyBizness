import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@fb/ui";

export function FamilyGoalPlanning() {
  return <div className="mb-8 space-y-4">
    <Card><CardHeader><CardTitle>Wealth with a purpose</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-muted-foreground">Give each family commitment a target, horizon and funding plan. Saved goals below remain the single goal register.</p><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      ["Children’s education", "education"], ["Philanthropy", "custom_save_up"], ["Marriage & celebrations", "wedding"], ["Family emergency fund", "custom_save_up"], ["Providence & pensions", "retirement"], ["Stewardship fund", "custom_save_up"], ["Staff welfare fund", "custom_save_up"], ["Next-generation enterprise", "custom_save_up"],
    ].map(([title, type]) => <Link className="rounded-lg border p-4 text-sm font-semibold hover:bg-muted focus-visible:ring-2" key={title} to={`/goals/new?purpose=${encodeURIComponent(title)}&type=${type}`}>{title}<span className="mt-2 block text-xs font-normal text-muted-foreground">Plan a goal →</span></Link>)}</div></CardContent></Card>
    <Card><CardHeader><CardTitle>Day-to-day stewardship</CardTitle></CardHeader><CardContent><div className="grid gap-4 md:grid-cols-3">{[
      ["1 · Review funding", "Check contributions against everyday spending and the family budget.", "/spending/budget", "Open budget"],
      ["2 · Check the mandate", "Review the investment policy statement before selecting goal funding assets.", "/office/policy", "Review IPS"],
      ["3 · Follow through", "Schedule a review and manage responsibilities in the existing family task register.", "/office/business", "Open responsibilities"],
    ].map(([title, text, href, action]) => <div key={title}><h3 className="font-semibold">{title}</h3><p className="my-2 text-sm text-muted-foreground">{text}</p><Link className="text-sm underline" to={href}>{action} →</Link></div>)}</div><p className="mt-4 text-xs text-muted-foreground">Planning links are available now. Automatic IPS enforcement and goal-to-task synchronization are not connected.</p></CardContent></Card>
  </div>;
}
