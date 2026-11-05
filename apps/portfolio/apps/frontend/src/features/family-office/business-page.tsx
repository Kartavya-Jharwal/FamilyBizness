import { GovernanceSummary } from "./governance-summary";
import { EstateFundingVisual } from "./capital-workspace";
import { DetailPanel } from "./visual-primitives";
import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@fb/ui";
import { FamilyOfficeShell } from "./family-office-shell";
import { OperationsWorkspace } from "./operations-page";

const GovernanceWorkspace = lazy(() => import("./governance-page").then(module => ({ default: module.GovernanceWorkspace })));
const ConstitutionLinkageWorkspace = lazy(() => import("./ips-visual").then(module => ({ default: module.IpsVisual })));
const EstateWorkspace = lazy(() => import("./estate-statutory-page").then(module => ({ default: module.EstateWorkspace })));
const FinancialWorkspace = lazy(() => import("./capital-workspace").then(m=>({default:m.CapitalWorkspace})));

const sections = [
  ["governance", "Governance & succession"],
  ["estate", "Estate planning"],
  ["operations", "Day-to-day operations"],
] as const;

export default function BusinessPage() {
  const [params, setParams] = useSearchParams();
  const selected = params.get("tab");
  const tab = ["constitution","financials",...sections.map(([value])=>value)].includes(selected??"") ? selected! : "operations";
  return <FamilyOfficeShell title="Family business">
    <Tabs value={tab} onValueChange={value => setParams(current => {
      const next = new URLSearchParams(current);
      next.set("tab", String(value));
      return next;
    })}>
      <TabsList aria-label="Family business sections" className="h-auto flex-wrap justify-start">
        {sections.map(([value, label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
      </TabsList>
      <TabsContent value="governance"><Suspense fallback={<p>Opening governance and succession...</p>}><GovernanceSummary><GovernanceWorkspace /></GovernanceSummary></Suspense></TabsContent>
      <TabsContent value="constitution"><Suspense fallback={<p>Opening constitution linkage...</p>}><ConstitutionLinkageWorkspace /></Suspense></TabsContent>
      <TabsContent value="estate"><Suspense fallback={<p>Opening estate planning...</p>}><div className="space-y-5"><EstateFundingVisual/><DetailPanel title="Ownership register and estate models"><EstateWorkspace /></DetailPanel></div></Suspense></TabsContent>
      <TabsContent value="operations"><OperationsWorkspace business /></TabsContent>
      <TabsContent value="financials"><Suspense fallback={<p>Opening financial reports...</p>}><FinancialWorkspace /></Suspense></TabsContent>
    </Tabs>
  </FamilyOfficeShell>;
}
