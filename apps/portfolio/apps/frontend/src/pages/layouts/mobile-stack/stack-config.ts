import type { StackTab } from "./stack-model";

/** Tab that a link straight to a page outside every tab opens in. */
export const HOME_TAB = "office/case";

/**
 * Paths that stay outside every tab: add-on pages, which run in iframes that
 * keep running while hidden. Matched by prefix because the add-on menu loads
 * after the app starts.
 */
export const OUTSIDE_TAB_PREFIXES: readonly string[] = ["/addons/", "/addon/"];

/**
 * Destinations that keep replacing one another instead of stacking: the
 * assistant's tool cards register in effects, which a hidden screen pauses, so
 * a kept chat would lose what was typed into a card.
 */
const UNSTACKED_DESTINATIONS = new Set(["/assistant"]);

/**
 * The phone layout's stacked tabs: one per destination of the app's
 * navigation, each keeping its own stack of screens.
 */
const OFFICE_ALIASES:Record<string,string[]>={
  "/office/case":["/"],
  "/office/finance":["/office/estate"],
  "/office/simulation":["/dashboard","/net-worth","/holdings","/activities","/insights"],
  "/office/business":["/office/governance","/office/philanthropy"],
  "/office/constitution":["/office/sources","/governance/constitution"],
  "/settings/general":["/settings","/office/admin"],
};
export function stackTabsFor(hrefs:readonly string[]):StackTab[]{
  return hrefs.filter(href=>!UNSTACKED_DESTINATIONS.has(href)).map(href=>({id:href.replace(/^\//,""),rootPath:href,...(OFFICE_ALIASES[href]?{aliases:OFFICE_ALIASES[href]}:{})}));
}
