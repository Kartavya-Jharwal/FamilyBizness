import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export const officeLinks = [
  ["/office/case", "Family office"],
  ["/dashboard", "Portfolio"], ["/office", "Calendar"], ["/office/business", "Family business"], ["/office/governance", "Governance"],
  ["/office/policy", "Investment policy"], ["/governance/constitution", "Constitution & IPS"],
  ["/office/simulation", "Portfolio & scenarios"],
  ["/office/review", "Stewardship review"], ["/office/philanthropy", "Philanthropy & collections"], ["/office/sources", "Source register"],
] as const;

export function FamilyOfficeShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-28 md:p-6">
    <header className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">Family office · planning workspace</p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <nav aria-label="Family office pillars" className="flex flex-wrap gap-2">
        {officeLinks.map(([href, label]) => <NavLink key={href} end to={href} className={({ isActive }) => `rounded-md border px-3 py-2 text-sm ${isActive ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground hover:bg-muted"}`}>{label}</NavLink>)}
      </nav>
      <p className="rounded-md border bg-muted p-3 text-sm text-foreground">Planning prototype. Example records and assumptions are fictional until replaced and reviewed. Saved changes stay in this browser profile. Scenario results do not update accounting records or execute transactions.</p>
    </header>
    {children}
  </main>;
}
