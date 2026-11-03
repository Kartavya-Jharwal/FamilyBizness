import { getDynamicNavItems, subscribeToNavigationUpdates } from "@/addons/addons-runtime-context";
import { Icons } from "@fb/ui/components/ui/icons";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getAddonNavPinKey, useAddonNavigationPins } from "./addon-navigation-pins";

export interface NavLink {
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
      { icon: <Icons.Dashboard className="size-6" />, title: "Family workspace", href: "/office/case" },
      { icon: <Icons.Holdings className="size-6" />, title: "Portfolio", href: "/dashboard" },
      { icon: <Icons.Goals className="size-6" />, title: "Family business", href: "/office/business", keywords: ["ERPNext", "estate planning", "operations", "tasks", "financial reports"] },
      { icon: <Icons.Activity className="size-6" />, title: "Constitution & IPS", href: "/governance/constitution" },
      { icon: <Icons.Insight className="size-6" />, title: "Investment policy", href: "/office/policy" },
      { icon: <Icons.Activity className="size-6" />, title: "Calendar", href: "/office" },
    ],
    secondary: [
      { icon: <Icons.Activity className="size-6" />, title: "Stewardship review", href: "/office/review", keywords: ["warnings", "risk", "FMEA", "please fix", "sources"] },
      { icon: <Icons.Insight className="size-6" />, title: "Insights", href: "/insights" },
      { icon: <Icons.Settings className="size-6" />, title: "Administration", href: "/settings", keywords: ["settings", "currency", "accounts", "configuration"] },
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
  const primary = [...staticNavigation.primary];
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

  // Dashboard and Net Worth are grouped together
  if (normalizedHref === "/dashboard") {
    return (
      normalizedPath === "/" || normalizedPath === "/dashboard" || normalizedPath === "/net-worth"
    );
  }

  return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
}
