import { Icons } from "@fb/ui/components/ui/icons";
import type { ReactNode } from "react";

export interface NavLink {
  children?: NavLink[];
  depth?: number;
  allowedRoles?: OfficeRole[];
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

export type OfficeRole = "Associate"|"Managing Director"|"Family Patriarch"|"Family Board"|"Legal Counsel";
export const allRoles:OfficeRole[]=["Associate","Managing Director","Family Patriarch","Family Board","Legal Counsel"];
const leaders:OfficeRole[]=["Managing Director","Family Patriarch"];
const staff:OfficeRole[]=[...leaders,"Associate"];
const investments:OfficeRole[]=[...staff,"Legal Counsel"];
export function currentRole():OfficeRole { const id=localStorage.getItem("familybizness:selected-demo-profile");return ({"office-role-0":"Family Patriarch","office-role-1":"Family Board","office-role-2":"Managing Director","office-role-4":"Associate","office-role-5":"Legal Counsel"} as Record<string,OfficeRole>)[id??""]??"Managing Director"; }
const sectionIcons:Record<string,typeof Icons.Folder>={Stewardship:Icons.Briefcase,"Family Constitution":Icons.File,"Day-to-day Operations":Icons.Calendar,"Capital and Liquidity":Icons.Coins,"Portfolio and Scenario":Icons.Activity2,Settings:Icons.Settings2,About:Icons.Info};
const page=(title:string,href:string,allowedRoles:OfficeRole[]=staff):NavLink=>{const Icon=sectionIcons[title]??Icons.File;return {title,href,allowedRoles,icon:<Icon className="size-5"/>};};
export const settingsNavigation:NavLink[]=[page("General","/settings/general",staff),page("Appearance","/settings/appearance",staff),page("Data","/settings/records",staff),page("Integrations","/settings/connections",staff),page("Accessibility","/settings/accessibility",staff)];
export const officeNavigation:NavigationProps={primary:[
 page("Stewardship","/office/case"),
 {...page("Family Constitution","/office/constitution",leaders),children:[page("Charter & adoption","/office/constitution",leaders),page("Investment Policy Statement","/office/policy",leaders),page("Governance & Succession","/office/business",leaders),page("Estate Planning","/office/business?tab=estate",leaders)]},
 {...page("Day-to-day Operations","/office"),children:[page("Calendar","/office"),page("Family Goals","/goals",[...leaders,"Family Board"])]},
 {...page("Capital and Liquidity","/office/finance",[...staff,"Family Board"]),children:[page("Overview","/office/finance",[...staff,"Family Board"]),page("Budget and Expenditure","/spending/budget"),page("Investment Fees","/office/fees"),page("Trading Analytics","/office/trading"),page("Financial Statements","/office/statements")]},
 {...page("Portfolio and Scenario","/office/simulation",investments),children:[page("Portfolio","/office/simulation?tab=portfolio",investments),page("Stochastic Process Lab","/office/stochastic",investments),page("Scenario Analysis","/office/scenarios",investments),page("Allocations","/office/simulation?tab=allocation",investments),page("Family FIRE","/office/simulation?tab=fire",investments),page("X-ray and Risk","/office/simulation?tab=xray",investments)]}
],secondary:[{...page("Settings","/settings/general",staff),children:settingsNavigation},page("About","/about",staff)]};
export function filterNavigation(items:NavLink[],role=currentRole(),depth=0):NavLink[]{return items.flatMap(item=>{const children=item.children?filterNavigation(item.children,role,depth+1):undefined;const allowed=!item.allowedRoles||item.allowedRoles.includes(role);return allowed||children?.length?[{...item,depth,href:allowed?item.href:children![0].href,children}]:[];});}
export function flattenNavigation(items:NavLink[]):NavLink[]{return Array.from(new Map(items.flatMap(item=>[item,...flattenNavigation(item.children??[])]).map(item=>[item.href,item])).values());}
export function routeAllowed(path:string,role=currentRole()){if(path==="/")return true;if(path==="/settings")return settingsNavigation.some(item=>item.allowedRoles?.includes(role));if(["/office/sources","/governance/constitution","/office/governance","/office/estate"].some(x=>path===x||path.startsWith(x+"/")))return leaders.includes(role);const matches=flattenNavigation([...officeNavigation.primary,...officeNavigation.secondary??[]]).filter(item=>path===item.href.split("?")[0]||path.startsWith(item.href.split("?")[0]+"/"));if(matches.length){const longest=Math.max(...matches.map(item=>item.href.split("?")[0].length));return matches.some(item=>item.href.split("?")[0].length===longest&&item.allowedRoles?.includes(role));}return role==="Managing Director"||role==="Family Patriarch"||(role==="Associate"&&!path.includes("constitution")&&!path.startsWith("/goals"))||(role==="Legal Counsel"&&["/holdings","/insights","/activities"].some(x=>path.startsWith(x)));}
export function useNavigation():NavigationProps{return {primary:filterNavigation(officeNavigation.primary),secondary:filterNavigation(officeNavigation.secondary??[]),addons:[],pinnedAddons:[],addonMenuItems:[]};}

export function isPathActive(pathname: string, href: string): boolean {
  if(href.includes("?"))return pathname+window.location.search===href||pathname+window.location.hash.split("?").slice(1).map(x=>"?"+x).join("")===href;
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
