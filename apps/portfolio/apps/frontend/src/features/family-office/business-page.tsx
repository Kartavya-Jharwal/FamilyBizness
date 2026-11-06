import { GovernanceSummary } from "./governance-summary";
import { EstateFundingVisual } from "./capital-workspace";
import { DetailPanel } from "./visual-primitives";
import { lazy, Suspense } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { FamilyOfficeShell } from "./family-office-shell";
import { OperationsWorkspace } from "./operations-page";

const GovernanceWorkspace = lazy(() => import("./governance-page").then(module => ({ default: module.GovernanceWorkspace })));
const EstateWorkspace = lazy(() => import("./estate-statutory-page").then(module => ({ default: module.EstateWorkspace })));

const sections = [
  ["governance", "Governance and Succession"],
  ["estate", "Estate Planning"],
  ["operations", "Day-to-day Operations"],
] as const;

export default function BusinessPage() {
  const [params] = useSearchParams();
  const selected = params.get("tab");
  if (selected === "constitution") return <Navigate to="/office/constitution" replace />;
  if (selected === "financials") return <Navigate to="/office/finance" replace />;
  const tab = sections.some(([value]) => value === selected) ? selected! : "governance";
  const title = sections.find(([value]) => value === tab)?.[1] ?? "Governance and Succession";
  return <FamilyOfficeShell title={title}>
    {tab === "governance" && <Suspense fallback={<p>Opening governance and succession...</p>}><GovernanceSummary><GovernanceWorkspace /></GovernanceSummary></Suspense>}
    {tab === "estate" && <Suspense fallback={<p>Opening estate planning...</p>}><div className="grid gap-5"><EstateFundingVisual/><DetailPanel title="Ownership register and estate models"><EstateWorkspace /></DetailPanel></div></Suspense>}
    {tab === "operations" && <OperationsWorkspace business />}
  </FamilyOfficeShell>;
}
