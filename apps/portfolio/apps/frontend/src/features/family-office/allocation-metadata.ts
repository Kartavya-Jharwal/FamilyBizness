import { z } from "zod";
/** Saved mandate classifications. Regional weights are explicit Board scenario assumptions,
 * never an assertion that audited fund constituent data is available. */
export const allocationMetadataSchema = z.object({
  platform: z.string().min(1).optional(), provider: z.string().min(1).optional(), accountType: z.string().min(1).optional(),
  geography: z.array(z.object({ continent: z.string().min(1), region: z.string().min(1), marketDevelopment: z.enum(["Developed markets", "Other markets"]), weight: z.number().finite().min(0).max(100) })).min(1).max(30).refine(rows=>Math.abs(rows.reduce((n,r)=>n+r.weight,0)-100)<1e-6,"Regional allocation weights must total 100%.").optional(),
  source: z.string().min(1).optional(),
});
export type AllocationMetadata = z.infer<typeof allocationMetadataSchema>;
const source = "Board-model allocation register · fictional custody/provider names and regional mandate assumptions; not audited fund constituent look-through";
const geo=(continent:string,region:string,weight:number,marketDevelopment:"Developed markets"|"Other markets"="Developed markets")=>({continent,region,weight,marketDevelopment});
const uk=[geo("Europe","United Kingdom",100)];
export const preparedSecurityClassifications: Record<string,AllocationMetadata> = {
 "EQ-GLOBAL": {platform:"Meridian Investment Platform",provider:"Aster Index Funds",accountType:"Family brokerage",geography:[geo("North America","North America",55),geo("Europe","Europe ex-UK",20),geo("Europe","United Kingdom",10),geo("Asia Pacific","Developed Asia Pacific",10),geo("Asia Pacific","Other Asia Pacific",5,"Other markets")],source},
 "EQ-ENERGY": {platform:"Meridian Investment Platform",provider:"Direct equity basket · not an ETF",accountType:"Family brokerage",geography:[geo("North America","North America",60),geo("Europe","United Kingdom",25),geo("Middle East & Africa","Other markets",15,"Other markets")],source},
 "BOND": {platform:"Meridian Investment Platform",provider:"Aster Bond Funds",accountType:"Family brokerage",geography:[geo("Europe","United Kingdom",60),geo("North America","North America",25),geo("Europe","Europe ex-UK",15)],source},
 "CASH": {platform:"Meridian Investment Platform",provider:"Not an ETF",accountType:"Brokerage liquidity",geography:uk,source},
 "PRIVATE": {platform:"Family Direct Investment Office",provider:"Not an ETF",accountType:"Private investment account",geography:uk,source},
};
export const preparedBookClassifications: Record<string,AllocationMetadata> = {
 "H-CASH": {platform:"Albion Private Bank",provider:"Not an ETF",accountType:"Treasury deposit",geography:uk,source},
 "H-LISTED": {platform:"Meridian Investment Platform",provider:"Allocated by registered security",accountType:"Family brokerage",source},
 "H-PRIVATE": preparedSecurityClassifications.PRIVATE,
 "H-SUB": {platform:"Family Enterprise Register",provider:"Not an ETF",accountType:"Operating-company ownership",geography:[geo("Europe","United Kingdom",90),geo("Asia Pacific","Other Asia Pacific",10,"Other markets")],source},
 "H-DEBT": {platform:"Albion Private Bank",provider:"Not an ETF",accountType:"Holding-company debt",geography:uk,source},
};
export function withPreparedClassifications<T extends { id:string; allocation?:AllocationMetadata }>(rows:T[],defaults:Record<string,AllocationMetadata>):T[]{return rows.map(row=>defaults[row.id]?{...row,allocation:{...structuredClone(defaults[row.id]),...structuredClone(row.allocation??{})}}:row);}
