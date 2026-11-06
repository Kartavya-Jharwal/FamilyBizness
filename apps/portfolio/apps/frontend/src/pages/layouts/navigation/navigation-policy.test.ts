import {describe,it,expect} from "vitest";
import {routeAllowed,filterNavigation,officeNavigation,flattenNavigation} from "./app-navigation";
describe("Office role navigation",()=>{
 it("assigns depth consistently from tree data",()=>{const rows=filterNavigation(officeNavigation.primary,"Managing Director");expect(rows[1].depth).toBe(0);expect(rows[1].children?.every(row=>row.depth===1)).toBe(true);});
 it("guards legacy source and governance routes",()=>{for(const role of ["Associate","Family Board","Legal Counsel"] as const)for(const path of ["/office/sources","/office/governance","/office/estate","/governance/constitution"])expect(routeAllowed(path,role)).toBe(false);});
 it("keeps board goals while hiding finance details",()=>{expect(routeAllowed("/goals","Family Board")).toBe(true);expect(routeAllowed("/office/finance","Family Board")).toBe(true);expect(routeAllowed("/office/statements","Family Board")).toBe(false);expect(flattenNavigation(filterNavigation(officeNavigation.primary,"Family Board")).some(p=>p.href==="/goals")).toBe(true);});
 it("keeps board and counsel within their specified page sets",()=>{for(const role of ["Family Board","Legal Counsel"] as const){expect(filterNavigation(officeNavigation.secondary??[],role)).toHaveLength(0);for(const path of ["/settings","/settings/general","/settings/records","/about"])expect(routeAllowed(path,role)).toBe(false);}});
 it("guards direct access for associate and counsel",()=>{expect(routeAllowed("/goals/new","Associate")).toBe(false);expect(routeAllowed("/office/constitution","Associate")).toBe(false);expect(routeAllowed("/office/finance","Legal Counsel")).toBe(false);expect(routeAllowed("/office/stochastic","Legal Counsel")).toBe(true);});
});
