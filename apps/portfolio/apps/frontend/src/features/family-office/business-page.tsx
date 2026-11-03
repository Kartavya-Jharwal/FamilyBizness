import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fb/ui";
import { FamilyOfficeShell } from "./family-office-shell";
import { OperationsWorkspace } from "./operations-page";

const GovernanceWorkspace = lazy(() => import("./governance-page").then(module => ({ default: module.GovernanceWorkspace })));
const ConstitutionLinkageWorkspace = lazy(() => import("./constitution-linkage-workspace").then(module => ({ default: module.ConstitutionLinkageWorkspace })));
const EstateWorkspace = lazy(() => import("./estate-statutory-page").then(module => ({ default: module.EstateWorkspace })));
const FinancialWorkspace = lazy(() => import("./finance-book-workspace"));

const sections = [
  ["governance", "Governance & succession"],
  ["constitution", "Constitution linkage"],
  ["estate", "Estate planning"],
  ["operations", "Day-to-day operations"],
  ["financials", "Financial reports"],
] as const;

export default function BusinessPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("tab");
  const tab = sections.some(([value]) => value === selected) ? selected! : "operations";
  return <FamilyOfficeShell title="Family business">
    <p className="text-sm text-muted-foreground">Governance and constitution rules connect ownership, succession, estate liquidity and the family's day-to-day work. These sections share the existing family records and planning tools.</p>
    <Tabs value={tab} onValueChange={value => setParams(current => {
      const next = new URLSearchParams(current);
      next.set("tab", String(value));
      return next;
    })}>
      <TabsList aria-label="Family business sections" className="h-auto flex-wrap justify-start">
        {sections.map(([value, label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
      </TabsList>
      <TabsContent value="governance"><Suspense fallback={<p>Opening governance and succession...</p>}><GovernanceWorkspace /></Suspense></TabsContent>
      <TabsContent value="constitution"><Suspense fallback={<p>Opening constitution linkage...</p>}><ConstitutionLinkageWorkspace /></Suspense></TabsContent>
      <TabsContent value="estate"><Suspense fallback={<p>Opening estate planning...</p>}><EstateWorkspace /></Suspense></TabsContent>
      <TabsContent value="operations"><OperationsWorkspace business /></TabsContent>
      <TabsContent value="financials"><Suspense fallback={<p>Opening financial reports...</p>}><FinancialWorkspace /></Suspense></TabsContent>
    </Tabs>
  </FamilyOfficeShell>;
}
