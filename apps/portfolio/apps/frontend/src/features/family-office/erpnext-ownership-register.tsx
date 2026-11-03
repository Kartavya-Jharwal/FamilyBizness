/** ERPNext Shareholder DocType frontend mask adaptation; GPL-3.0. */
import { useMemo, useState } from "react";
import type { IhtInput } from "./estate-iht-model";
import { erpShareholderMask } from "./erpnext-frontend";

type Assets = IhtInput["assets"];
const field = "w-full rounded-md border border-input bg-background p-2 text-foreground";

/** Title/Company fields and the Share Balance table are extracted from the donor
 * DocType. The host supplies its existing estate holdings and editor selection. */
export function ErpEstateOwnershipRegister({ assets, onSelect }: { assets: Assets; onSelect: (id: string) => void }) {
  const [owner, setOwner] = useState("All");
  const [company, setCompany] = useState("All");
  const owners = [...new Set(assets.map(asset => asset.legalOwner))];
  const companies = [...new Set(assets.map(asset => asset.entity))];
  const visible = useMemo(() => assets.filter(asset => (owner === "All" || asset.legalOwner === owner) && (company === "All" || asset.entity === company)), [assets, owner, company]);
  return <div className="space-y-4" data-donor-mask="erpnext-shareholder">
    <div className="grid gap-3 sm:grid-cols-2">{erpShareholderMask.filter(mask => mask.fieldname === "title" || mask.fieldname === "company").map(mask => <div key={mask.fieldname}><label className="text-sm" htmlFor={`estate-${mask.fieldname}`}>{mask.fieldname === "title" ? "Shareholder / legal owner" : "Company / entity"}</label><select id={`estate-${mask.fieldname}`} className={field} value={mask.fieldname === "title" ? owner : company} onChange={event => mask.fieldname === "title" ? setOwner(event.target.value) : setCompany(event.target.value)}><option>All</option>{(mask.fieldname === "title" ? owners : companies).map(value => <option key={value}>{value}</option>)}</select></div>)}</div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="pb-3 text-left font-medium">{erpShareholderMask.find(mask => mask.fieldname === "share_balance")?.label} &amp; estate holdings</caption><thead><tr>{["Holding", "Company / entity", "Legal owner", "Beneficiary", "Estate share"].map(heading => <th key={heading} className="border-b p-3">{heading}</th>)}</tr></thead><tbody>{visible.map(asset => <tr key={asset.id}><td className="border-b p-3"><button className="text-left font-medium underline" onClick={() => onSelect(asset.id)}>{asset.label}</button></td><td className="border-b p-3">{asset.entity}</td><td className="border-b p-3">{asset.legalOwner}</td><td className="border-b p-3">{asset.beneficiary}</td><td className="border-b p-3">{asset.share}%</td></tr>)}</tbody></table></div>
    {!visible.length && <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No holdings match this owner and entity.</p>}
  </div>;
}
