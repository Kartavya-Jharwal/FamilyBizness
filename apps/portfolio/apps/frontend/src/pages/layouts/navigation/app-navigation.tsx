import { getDynamicNavItems, subscribeToNavigationUpdates } from "@/addons/addons-runtime-context";
import { Icons } from "@fb/ui/components/ui/icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAddonNavPinKey, useAddonNavigationPins } from "./addon-navigation-pins";

export interface NavLink {
  children?: NavLink[];
  id?: string;
  title: string;
  href: string;
  icon?: ReactNode;
  keywords?: string[];
  label?: string; // Optional descriptive label for launcher/search
}

export interface NavigationProps {
  primary: NavLink[];
  secondary?: NavLink[];
  addons?: NavLink[];
  addonMenuItems?: NavLink[];
  pinnedAddons?: NavLink[];
  setAddonPinned?: (item: NavLink, pinned: boolean) => void;
}

function buildStaticNavigation(): NavigationProps {
  return {
    primary: [
      { icon: <Icons.Dashboard className="size-6" />, title: "Stewardship", href: "/office/case", keywords: ["family office", "responsibilities", "board"] },
      { icon: <Icons.Holdings className="size-6" />, title: "Capital & liquidity", href: "/office/finance", keywords: ["AUM", "consolidated capital", "cash flow", "estate", "valuation", "DCF"] },
      { icon: <Icons.Insight className="size-6" />, title: "Portfolio & scenarios", href: "/office/simulation", keywords: ["allocation", "risk", "Monte Carlo", "holdings", "performance", "FIRE", "X-ray", "sector", "ETF provider", "return methods"] },
      { icon: <Icons.Goals className="size-6" />, title: "Family business", href: "/office/business", keywords: ["ERPNext", "governance", "succession", "operations", "tasks"] },
      { icon: <Icons.Activity className="size-6" />, title: "Calendar", href: "/office" },
      { icon: <Icons.Insight className="size-6" />, title: "Investment policy statement", href: "/office/policy", keywords: ["IPS", "mandate", "limits"] },
      { icon: <Icons.Folder className="size-6" />, title: "Family constitution", href: "/office/constitution", keywords: ["charter", "clauses", "please fix", "legal"] },
    ],
    secondary: [
      { icon: <Icons.Settings className="size-6" />, title: "Settings", href: "/settings/general", keywords: ["preferences", "profiles", "sources", "currency", "accounts", "configuration"] },
    ],
  };
}

export function useNavigation() {
  const staticNavigation = useMemo(() => buildStaticNavigation(), []);
  const [dynamicItems, setDynamicItems] = useState<NavigationProps["addons"]>([]);
  const { hasConfiguredAddonPins, pinnedAddonIdSet, setAddonPinned, setPinnedAddonIds } =
    useAddonNavigationPins();

  // Subscribe to navigation updates from addons
  useEffect(() => {
    const updateDynamicItems = () => {
      const itemsFromRuntime = getDynamicNavItems();
      setDynamicItems(itemsFromRuntime);
    };

    // Initial load
    updateDynamicItems();

    // Subscribe to updates
    const unsubscribe = subscribeToNavigationUpdates(updateDynamicItems);

    return () => {
      unsubscribe();
    };
  }, []);

  // Spending lives entirely on the dashboard tab (and its deep-linked pages);
  // no top-level nav entry. Combine static navigation items with addons.
  const primary = staticNavigation.primary.map(item => item.href === "/office/finance" ? { ...item, children: [
    { title: "Family goals", href: "/goals" },
    { title: "Budget & expenditure", href: "/spending/budget" },
    { title: "Spending insights", href: "/spending/insights" },
    { title: "Investment fees", href: "/office/fees" },
    { title: "Trading analytics", href: "/office/trading" },
  ] } : item);
  const addons = useMemo(() => dynamicItems ?? [], [dynamicItems]);

  useEffect(() => {
    if (hasConfiguredAddonPins || addons.length !== 1) {
      return;
    }

    const onlyAddonId = getAddonNavPinKey(addons[0]);
    setPinnedAddonIds((currentIds) =>
      currentIds.includes(onlyAddonId) ? currentIds : [...currentIds, onlyAddonId],
    );
  }, [addons, hasConfiguredAddonPins, setPinnedAddonIds]);

  const pinnedAddons = useMemo(
    () => addons.filter((item) => pinnedAddonIdSet.has(getAddonNavPinKey(item))),
    [addons, pinnedAddonIdSet],
  );
  const addonMenuItems = useMemo(
    () => addons.filter((item) => !pinnedAddonIdSet.has(getAddonNavPinKey(item))),
    [addons, pinnedAddonIdSet],
  );
  const navigation: NavigationProps = {
    primary,
    secondary: staticNavigation.secondary,
    addons,
    addonMenuItems,
    pinnedAddons,
    setAddonPinned,
  };

  return navigation;
}

export function isPathActive(pathname: string, href: string): boolean {
  if (!href) {
    return false;
  }

  const ensureLeadingSlash = href.startsWith("/") ? href : `/${href}`;
  const normalize = (value: string) => {
    if (value.length > 1 && value.endsWith("/")) {
      return value.slice(0, -1);
    }
    return value;
  };

  const normalizedHref = normalize(ensureLeadingSlash);
  const normalizedPath = normalize(pathname);

  if (normalizedHref === "/") {
    return normalizedPath === "/";
  }

  // Preserve legacy deep links while keeping one daily destination per topic.
  if (normalizedHref === "/office") return normalizedPath === "/office";
  if (normalizedHref === "/office/case" && normalizedPath === "/office/review") return true;
  if (normalizedHref === "/office/finance" && normalizedPath === "/office/estate") return true;
  if (normalizedHref === "/office/simulation" && ["/", "/dashboard", "/net-worth", "/holdings", "/activities", "/insights"].some(path => normalizedPath === path || (path !== "/" && normalizedPath.startsWith(path + "/")))) return true;
  if (normalizedHref === "/office/business" && ["/office/governance", "/office/philanthropy"].includes(normalizedPath)) return true;
  if (normalizedHref === "/settings/general" && normalizedPath.startsWith("/settings")) return true;
  if (normalizedHref === "/office/constitution" && ["/office/sources", "/governance/constitution"].includes(normalizedPath)) return true;

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}
