import { financeBookSchema, consolidateBook, fairValueWealth, type FinanceBook } from "./finance-book-model";
import { investmentSchema, type InvestmentInput } from "./investment-model";
import { ihtSchema, type IhtInput } from "./estate-iht-model";
import type { DistributionInput } from "./golden-bird-rules";
export function stewardshipScenario(base: {
    book: FinanceBook;
    investments: InvestmentInput;
    "statutory-estate": IhtInput;
    "constitution-distribution": DistributionInput;
}) {
    const b = structuredClone(base.book);
    b.source = "Family office management accounts";
    b.asOf = "2026-11-05";
    b.entities = b.entities.map(e => ({ ...e, openingCash: e.id === "holding" ? 3600000 : 700000, openingEquity: e.id === "holding" ? 22600000 : 11200000, distributions: e.id === "holding" ? 200000 : 0 }));
    const balance = (id: string, entity: string, account: string, kind: string, category: string, amount: number, elimination = "") => ({ id, entity, account, kind, category, amount, elimination, currency: "GBP" });
    b.balances = financeBookSchema.shape.balances.parse([
        balance("H-CASH", "holding", "Treasury cash", "asset", "cash", 4000000), balance("H-LISTED", "holding", "Liquid investment sleeve", "asset", "listed", 7200000), balance("H-PRIVATE", "holding", "Private investment sleeve", "asset", "private", 800000), balance("H-SUB", "holding", "Operating business investment", "asset", "private", 12000000, "ownership-business"), balance("H-DEBT", "holding", "Holding debt", "liability", "debt", 1000000), balance("H-EQUITY", "holding", "Family capital and reserves", "equity", "capital", 23000000),
        balance("B-CASH", "business", "Operating cash", "asset", "cash", 1000000), balance("B-ASSET", "business", "Operating assets", "asset", "operating", 13000000), balance("B-DEBT", "business", "Business debt", "liability", "debt", 2000000), balance("B-EQUITY", "business", "Subsidiary equity", "equity", "capital", 12000000, "ownership-business")
    ]);
    b.income = [{ id: "H-RETURN", entity: "holding", account: "Investment income", kind: "income", currency: "GBP", amount: 600000, elimination: "" }, { id: "B-SALES", entity: "business", account: "Operating revenue", kind: "income", currency: "GBP", amount: 6000000, elimination: "" }, { id: "B-COST", entity: "business", account: "Operating costs and depreciation", kind: "expense", currency: "GBP", amount: 5200000, elimination: "" }];
    b.movements = [{ id: "H-CF", entity: "holding", account: "Investment receipts", category: "operating", currency: "GBP", amount: 600000, elimination: "" }, { id: "H-DIST", entity: "holding", account: "Owner distributions", category: "financing", currency: "GBP", amount: -200000, elimination: "" }, { id: "B-CF", entity: "business", account: "Operating cash generation", category: "operating", currency: "GBP", amount: 1100000, elimination: "" }, { id: "B-CAPEX", entity: "business", account: "Property refurbishment", category: "investing", currency: "GBP", amount: -800000, elimination: "" }];
    b.dcf = { source: "Five-year operating plan", currency: "GBP", fcf: [900000, 980000, 1050000, 1120000, 1200000], discount: 10, growth: 2, debt: 2000000, cash: 1000000, ebitda: 1800000, multiple: 8, ownership: 100 };
    b.forecast = b.forecast.map(r => ({ ...r, receipts: r.entity === "holding" ? 75000 : 650000, operating: r.entity === "holding" ? 25000 : 440000, capex: r.entity === "holding" ? 15000 : 85000, distributions: r.entity === "holding" ? 73000 : 0, philanthropy: r.entity === "holding" ? 5000 : 0, ventures: r.entity === "holding" ? 10000 : 0, succession: r.entity === "holding" ? 15000 : 0, reserve: r.entity === "holding" ? 800000 : 350000 }));
    const wealth = fairValueWealth(b);
    const factors = [.83, .85, .87, .88, .86, .84, .89, .9, .92, .91, .94, .95, .97, .96, .98, 1];
    b.wealthHistory = factors.map((factor, i) => ({ asOf: new Date(Date.UTC(2025, 7 + i, 1)).toISOString().slice(0, 10), grossAum: wealth.grossAum * factor, netWealth: wealth.grossAum * factor - 1000000, externalFlow: i === 8 ? 100000 : 0, source: "Monthly family capital report" }));
    b.wealthHistory[b.wealthHistory.length - 1].asOf = b.asOf;
    const investments = investmentSchema.parse({ ...base.investments, source: "Family investment mandate", initial: 8000000, spend: 876000, reserve: 800000, paths: 300, target: 5, riskMax: 12, equityMax: 65, securities: base.investments.securities.map(s => ({ ...s, currency: "GBP" })), eventCost: 1200000 });
    const estate = ihtSchema.parse({ ...base["statutory-estate"], source: "Family estate funding plan", assets: base["statutory-estate"].assets.map(a => ({ ...a, value: a.id === "business" ? wealth.fairValue : a.id === "home" ? 1200000 : a.id === "cash" ? 350000 : a.value })), openingFunding: 350000, funding: [{ id: "insurance", label: "Succession insurance", month: 3, amount: 2000000, source: "Trust-held policy" }] });
    const distribution = { ...base["constitution-distribution"], unrestrictedCash: 4000000, unfundedDebtAndStatutory: 450000, monthlyFixedCosts: 80000, approvedDignityReserve: 150000, distributableProfitCapacity: 1200000 };
    const checked = financeBookSchema.parse(b);
    const errors = consolidateBook(checked).errors;
    if (errors.length)
        throw Error(errors.join("; "));
    return { book: checked, investments, "statutory-estate": estate, "constitution-distribution": distribution };
}
