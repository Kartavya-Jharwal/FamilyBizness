import PhilanthropyPage from "@/features/family-office/philanthropy-page";
import FinanceAddonWorkspaces from "@/features/family-office/finance-addon-workspaces";
import { lazy, memo, Suspense, useEffect, useState } from "react";
import { Navigate, Route, Routes, type Location } from "react-router-dom";

import {
  getDynamicRoutes,
  subscribeToNavigationUpdates,
  type DynamicRouteEntry,
} from "@/addons/addons-runtime-context";
import { AddonIframeRoute } from "@/addons/iframe/addon-iframe-route";
import ActivityManagerPage from "@/pages/activity/activity-manager-page";
import ActivityPage from "@/pages/activity/activity-page";
import ActivityImportPage from "@/pages/activity/import/activity-import-page";
import AssetsPage from "@/pages/asset/assets-page";
import HoldingsPage from "@/pages/holdings/holdings-page";
import PortfolioInsightsPage from "@/pages/insights/portfolio-insights";
import AnalysisAttributionPage from "@/pages/insights/analysis/attribution-page";
import NotFoundPage from "@/pages/not-found";
import SettingsAccountsPage from "@/pages/settings/accounts/accounts-page";
import PortfoliosPage from "@/pages/settings/portfolios/portfolios-page";
import SettingsAppearancePage from "@/pages/settings/appearance/appearance-page";
import SettingsLayout from "@/pages/settings/settings-layout";
import AccountPage from "./pages/account/account-page";
import AiAssistantPage from "./pages/ai-assistant/ai-assistant-page";
import AssetProfilePage from "./pages/asset/asset-profile-page";
import HealthPage from "./pages/health/health-page";
import AboutSettingsPage from "./pages/settings/about/about-page";
import ContributionLimitPage from "./pages/settings/contribution-limits/contribution-limits-page";
import ExportSettingsPage from "./pages/settings/exports/exports-page";
import GeneralSettingsPage from "./pages/settings/general/general-page";
import TaxonomiesPage from "./pages/settings/taxonomies/taxonomies-page";
import SpendingInsightsPage from "./features/spending/pages/spending-insights-page";
import SpendingBudgetPage from "./features/spending/pages/spending-budget-page";
import SpendingSettingsPage from "./pages/settings/spending/spending-settings-page";
import SpendingSettingsCategoriesPage from "./pages/settings/spending/categories/spending-categories-page";
import SpendingSettingsEventsPage from "./pages/settings/spending/events/spending-events-page";
import SpendingSettingsRulesPage from "./pages/settings/spending/rules/spending-rules-page";
import SpendingSetupPage from "./pages/settings/spending/setup/spending-setup-page";
import GoalsDashboardPage from "@/features/goals/pages/goals-dashboard-page";
import GoalNewPage from "@/features/goals/pages/goal-new-page";
import GoalDetailPage from "@/features/goals/pages/goal-detail-page";
import GoalRetirementGuidePage from "@/features/goals/pages/goal-retirement-guide-page";

const ConstitutionPage = lazy(() => import("./features/governance/constitution/constitution-page"));
const OfficeReviewPage = lazy(() => import("./features/family-office/office-review-workspace"));
const OfficeReviewWorkspace = lazy(() => import("./features/family-office/office-review-workspace").then(m=>({default:m.OfficeReviewWorkspace})));
const OperationsPage = lazy(() => import("./features/family-office/operations-page"));
const GovernancePage = lazy(() => import("./features/family-office/governance-page"));
const BusinessPage = lazy(() => import("./features/family-office/business-page"));
const SimulationPage = lazy(() => import("./features/family-office/portfolio-visual"));
const SourcesPage = lazy(() => import("./features/family-office/sources-page"));
const PolicyPage = lazy(() => import("./features/family-office/ips-visual"));
const CapitalPage=lazy(()=>import("./features/family-office/capital-workspace"));
const FamilyConstitutionPage=lazy(()=>import("./features/family-office/family-constitution-page"));
const OfficeSettingsPage=lazy(()=>import("./features/family-office/office-settings-page"));
const CaseAdministration=lazy(()=>import("./features/family-office/case-administration"));
const AdministrationPage=lazy(()=>import("./features/family-office/administration-page"));
const CasePage = lazy(() => import("./features/family-office/case-page"));
const PresentationPage = lazy(() => import("./features/family-office/presentation-page"));

function useDynamicAddonRoutes() {
  const [dynamicRoutes, setDynamicRoutes] =
    useState<DynamicRouteEntry[]>(getDynamicRoutes);

  useEffect(() => {
    const updateRoutes = () => setDynamicRoutes(getDynamicRoutes());
    updateRoutes();
    const unsubscribe = subscribeToNavigationUpdates(updateRoutes);
    return () => {
      unsubscribe();
    };
  }, []);

  return dynamicRoutes;
}

interface AppScreenRoutesProps {
  /**
   * Location to render instead of the current one. The phone layout keeps
   * earlier screens of a stack mounted, each at its own location.
   */
  location?: Partial<Location>;
}

/**
 * Pages of the main app, rendered inside `AppLayout`. Memoized so the shell
 * re-rendering (pull to refresh moves on every touch) does not re-render pages.
 */
export const AppScreenRoutes = memo(function AppScreenRoutes({
  location,
}: AppScreenRoutesProps) {
  const dynamicRoutes = useDynamicAddonRoutes();

  return (
    <Routes location={location}>
      <Route index element={<Navigate to="/office/case" replace />} />
      <Route path="office/admin" element={<Suspense fallback={<p>Opening administration...</p>}><AdministrationPage/></Suspense>} />
      <Route path="office/case" element={<Suspense fallback={<p className="p-6">Loading family case…</p>}><CasePage /></Suspense>} />
      <Route path="office/philanthropy" element={<PhilanthropyPage />} />
      <Route path="office/overview" element={<Suspense fallback={<p className="p-6">Loading stewardship studio…</p>}><PresentationPage /></Suspense>} />
      <Route path="office/review" element={<Suspense fallback={<p className="p-6">Opening stewardship review...</p>}><OfficeReviewPage /></Suspense>} />
      <Route path="office/business" element={<Suspense fallback={<p className="p-6">Opening family business...</p>}><BusinessPage /></Suspense>} />
      <Route path="office" element={<Suspense fallback={<p className="p-6">Loading family office…</p>}><OperationsPage /></Suspense>} />
      <Route path="office/governance" element={<Suspense fallback={<p className="p-6">Loading governance…</p>}><GovernancePage /></Suspense>} />
      <Route path="office/estate" element={<Suspense fallback={<p className="p-6">Loading estate scenario…</p>}><Navigate to="/office/business?tab=estate" replace /></Suspense>} />
      <Route path="office/finance" element={<Suspense fallback={<p className="p-6">Loading financials…</p>}><CapitalPage/></Suspense>} />
      <Route path="office/simulation" element={<Suspense fallback={<p className="p-6">Loading scenarios…</p>}><SimulationPage /></Suspense>} />
      <Route path="office/sources" element={<Suspense fallback={<p className="p-6">Loading source register…</p>}><SourcesPage /></Suspense>} />
      <Route path="office/constitution" element={<Suspense fallback={<p>Opening family constitution…</p>}><FamilyConstitutionPage/></Suspense>} />
      <Route path="office/policy" element={<Suspense fallback={<p className="p-6">Loading family policy…</p>}><PolicyPage /></Suspense>} />
      <Route path="dashboard" element={<Navigate to="/office/case" replace />} />
      <Route path="activities" element={<ActivityPage />} />
      <Route path="activities/manage" element={<ActivityManagerPage />} />
      <Route path="holdings" element={<HoldingsPage />} />
      <Route path="holdings/:assetId" element={<AssetProfilePage />} />
      <Route path="import" element={<ActivityImportPage />} />
      <Route path="accounts/:id" element={<AccountPage />} />
      <Route
        path="income"
        element={<Navigate to="/insights?tab=income" replace />}
      />
      <Route
        path="performance"
        element={<Navigate to="/insights?tab=performance" replace />}
      />
      <Route path="insights" element={<PortfolioInsightsPage />} />
      <Route path="governance/constitution" element={<Suspense fallback={<p className="p-6">Loading constitution workspace…</p>}><ConstitutionPage /></Suspense>} />
      <Route path="open-source" element={<AnalysisAttributionPage />} />
      <Route path="health" element={<HealthPage />} />
      <Route path="assistant" element={<AiAssistantPage />} />
      <Route
        path="allocation-targets"
        element={<Navigate to="/insights?tab=overview" replace />}
      />
      <Route path="goals" element={<GoalsDashboardPage />} />
      <Route path="office/connections" element={<Navigate to="/settings/connections" replace />} />
      <Route path="office/fees" element={<FinanceAddonWorkspaces />} />
      <Route path="office/trading" element={<FinanceAddonWorkspaces />} />
      <Route path="goals/new" element={<GoalNewPage />} />
      <Route path="goals/:goalId/guide" element={<GoalRetirementGuidePage />} />
      <Route path="goals/:goalId" element={<GoalDetailPage />} />
      <Route path="spending/insights" element={<SpendingInsightsPage />} />
      <Route path="spending/budget" element={<SpendingBudgetPage />} />
      {/* Dynamic addon routes */}
      {dynamicRoutes.map(({ path, addonId, routeId }) => (
        <Route
          key={`${addonId}:${routeId}`}
          path={path}
          element={<AddonIframeRoute addonId={addonId} routeId={routeId} />}
        />
      ))}
      <Route path="settings" element={<SettingsLayout />}>
        <Route path="connections" element={<FinanceAddonWorkspaces embedded />} />
        <Route index element={<Navigate to="/settings/general" replace />} />
        <Route path="office" element={<Suspense fallback={<p>Opening office settings…</p>}><OfficeSettingsPage/></Suspense>} />
        <Route path="records" element={<Suspense fallback={<p>Opening family records…</p>}><CaseAdministration/></Suspense>} />
        <Route path="sources" element={<Suspense fallback={<p>Opening source administration...</p>}><OfficeReviewWorkspace /></Suspense>} />
        <Route path="general" element={<GeneralSettingsPage />} />
        <Route path="accounts" element={<SettingsAccountsPage />} />
        <Route path="portfolios" element={<PortfoliosPage />} />
        <Route path="appearance" element={<SettingsAppearancePage />} />
        <Route path="about" element={<AboutSettingsPage />} />
        <Route path="exports" element={<ExportSettingsPage />} />
        <Route path="contribution-limits" element={<ContributionLimitPage />} />
        <Route path="spending" element={<SpendingSettingsPage />} />
        <Route
          path="spending/categories"
          element={<SpendingSettingsCategoriesPage />}
        />
        <Route
          path="spending/events"
          element={<SpendingSettingsEventsPage />}
        />
        <Route path="spending/rules" element={<SpendingSettingsRulesPage />} />
        <Route path="spending/setup" element={<SpendingSetupPage />} />
        <Route path="securities" element={<AssetsPage />} />
        <Route path="taxonomies" element={<TaxonomiesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
});
