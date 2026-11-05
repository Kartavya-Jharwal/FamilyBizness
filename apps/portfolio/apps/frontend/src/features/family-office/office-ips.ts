import { parseConstitution } from "@/features/governance/constitution/policy";
import type { ExecutableRule } from "./policy-engine";
import type { SourceRecord } from "./source-model";
export const officeIpsText = `# Family investment policy
## Portfolio mandate
Cash must be at least 10% of the investment portfolio.
Public equities must not exceed 65% of the investment portfolio.
Illiquid investments must not exceed 25% of the investment portfolio.
## Stewardship mandate
Maintain a liquid succession reserve of GBP 800,000.
Do not invest in controversial weapons.
Commitments above GBP 250,000 require two independent approvals.
Target a 5% annual net return within a 12% annual volatility limit.
`;
export const officeIpsSource: SourceRecord = { id: "FO-IPS-MANDATE", assignment: "Family office operating charter", section: "Investment mandate", excerpt: officeIpsText, interpretation: "The family Board sets numerical implementation limits for constitutional resilience, responsible investment and independent oversight.", target: "simulation", parameter: "cash, equity, illiquidity, reserve, sector and approval limits", basis: "operational-interpretation", status: "reviewed", reviewer: "Family Board" };
export function officeIpsRules(content = officeIpsText): ExecutableRule[] {
    const gates = parseConstitution(content).gates;
    const find = (field: string, asset?: string) => { const gate = gates.find(g => g.field === field && (!asset || g.assetClass === asset)); if (!gate || gate.threshold === null)
        throw new Error(`IPS parser did not compile ${asset ?? field}`); return gate.threshold; };
    const money = (pattern: RegExp) => { const found = content.match(pattern); if (!found)
        throw new Error("State the reserve and approval limits in GBP."); return Number(found[1].replaceAll(",", "")); };
    const sector = content.match(/Do not invest in ([^\n.]+)\./i)?.[1];
    if (!sector)
        throw new Error("State the excluded sector: Do not invest in [sector].");
    const approval = content.match(/require\s+(one|two|three|four|five|six|\d+)\s+independent approvals/i)?.[1];
    const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const count = approval ? (words[approval.toLowerCase()] ?? Number(approval)) : NaN;
    if (!Number.isInteger(count) || count < 1 || count > 20)
        throw new Error("State one to twenty independent approvals.");
    return [
        { id: "IPS-CASH", sourceId: officeIpsSource.id, kind: "cash-minimum", value: find("assetExposurePercent", "Cash & equivalents"), text: "Keep cash available" },
        { id: "IPS-EQUITY", sourceId: officeIpsSource.id, kind: "equity-maximum", value: find("assetExposurePercent", "Public equities"), text: "Limit listed-equity risk" },
        { id: "IPS-PRIVATE", sourceId: officeIpsSource.id, kind: "illiquid-maximum", value: find("illiquidPercent"), text: "Protect liquidity" },
        { id: "IPS-RESERVE", sourceId: officeIpsSource.id, kind: "reserve-minimum", value: money(/reserve of GBP ([\d,]+)/i), text: "Succession reserve" },
        { id: "IPS-VALUES", sourceId: officeIpsSource.id, kind: "excluded-sector", value: 0, text: sector },
        { id: "IPS-APPROVAL", sourceId: officeIpsSource.id, kind: "approval-threshold", value: money(/above GBP ([\d,]+)/i), text: String(count) },
    ];
}
