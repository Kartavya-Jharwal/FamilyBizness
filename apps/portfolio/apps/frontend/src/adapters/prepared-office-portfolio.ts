import type { Account, PortfolioWithAccounts } from "@/lib/types";
import { selectedProfileId } from "@/features/profiles/session";
import { preparedOfficeId } from "@/features/profiles/profile-workspace";
import { financeBookSchema, fairValueWealth, type FinanceBook } from "@/features/family-office/finance-book-model";
import { investmentSchema, type InvestmentInput } from "@/features/family-office/investment-model";

import type { AllocationMetadata } from "@/features/family-office/allocation-metadata";

export interface PreparedPosition {
  id: string; accountId: string; symbol: string; name: string; kind: "equity" | "fixed" | "cash" | "private" | "listed" | "other";
  value: number; localValue: number; currency: string; fx: number; cost: number; hasBasis: boolean;
  sourceRecordId: string; entity: string; sector: string; allocation?: AllocationMetadata;
}

const accountId = (id: string, category: string) => id === "H-CASH" ? "acc-cash" : id === "H-LISTED" ? "acc-public" : id === "H-PRIVATE" ? "acc-private" : category === "operating-business" ? "acc-business" : `acc-book-${id}`;

/** Read-through DTO projection only. FinanceBook still owns balances, FX, DCF,
 * liabilities and dated AUM; investment weights split its existing sleeve totals. */
export function projectPreparedOffice(book: FinanceBook, investments: InvestmentInput | null = null) {
  const wealth = fairValueWealth(book), fx = (currency: string) => book.fx.find(row => row.currency === currency)!.closing;
  const positions: PreparedPosition[] = [];
  const accounts: Account[] = wealth.positions.map((position, index) => {
    const record = book.balances.find(row => row.id === position.id)!;
    const id = accountId(position.id, position.category), business = position.category === "operating-business";
    const securities = investments && ["listed", "private"].includes(position.category) ? investments.securities.filter(row => position.category === "private" ? !row.liquid : row.liquid) : [];
    const totalWeight = securities.every(row => book.fx.some(rate => rate.currency === row.currency)) ? securities.reduce((sum, row) => sum + row.current, 0) : 0;
    const add = (key: string, name: string, kind: PreparedPosition["kind"], value: number, currency: string, sector: string, allocation = record.allocation, symbol = business ? "FAMILY-BUS" : record.category === "cash" ? book.currency : record.category.toUpperCase()) => {
      positions.push({ id: key, accountId: id, name, symbol, kind, value, localValue: value / fx(currency), currency, fx: fx(currency), cost: 0, hasBasis: false, sourceRecordId: record.id, entity: record.entity, sector, allocation });
    };
    if (totalWeight > 0) securities.forEach(security => add(`book-${record.id}-${security.id}`, security.name, security.kind === "bond" ? "fixed" : security.kind, position.value * security.current / totalWeight, security.currency, security.sector, security.allocation ?? record.allocation, security.id.replace(/^EQ-/, "")));
    else add(`book-${record.id}`, record.account, record.category === "cash" ? "cash" : business || record.category === "private" ? "private" : record.category === "listed" ? "listed" : "other", position.value, business ? book.dcf.currency : record.currency, business ? "Operating business" : record.category);
    return { id, name: record.account, accountType: record.category === "cash" ? "CASH" : "SECURITIES", group: business ? "Family business" : record.category === "cash" ? "Treasury" : "Investment mandate", balance: position.value, currency: book.currency, isDefault: index === 0, isActive: true, isArchived: false, trackingMode: "HOLDINGS", createdAt: new Date(`${book.asOf}T00:00:00Z`), updatedAt: new Date(`${book.asOf}T00:00:00Z`) };
  });
  const dated = book.wealthHistory.filter(row => row.asOf <= book.asOf && row.asOf !== book.asOf);
  const current = book.wealthHistory.find(row => row.asOf === book.asOf);
  const history = [...dated, { asOf: book.asOf, grossAum: wealth.grossAum, netWealth: wealth.fairValue, externalFlow: current?.externalFlow ?? 0, source: book.source }].sort((a, b) => a.asOf.localeCompare(b.asOf));
  const liabilities = book.balances.filter(row => book.wealthOwnerIds.includes(row.entity) && row.kind === "liability").reduce((sum, row) => sum + row.amount * fx(row.currency), 0);
  const mandateIds = accounts.filter(row => row.group === "Investment mandate").map(row => row.id);
  const portfolios: PortfolioWithAccounts[] = [
    { id: "pf-main", name: "Family Office", accountIds: accounts.map(row => row.id), sortOrder: 0, createdAt: book.asOf, updatedAt: book.asOf },
    { id: "pf-long-term", name: "Investment mandate", accountIds: mandateIds, sortOrder: 1, createdAt: book.asOf, updatedAt: book.asOf },
  ];
  return { book, wealth, currency: book.currency, asOf: book.asOf, accounts, positions, history, liabilities, portfolios };
}

let lastProjection: { book: string; investment: string | null; value: ReturnType<typeof projectPreparedOffice> } | undefined;

/** Only archived/custom profiles use the legacy store. A prepared source that
 * is missing or invalid cannot silently change the office reporting perimeter. */
export function readPreparedOfficePortfolio(storage: Pick<Storage, "getItem"> = localStorage, profile = selectedProfileId()) {
  if (profile !== preparedOfficeId) return null;
  const raw = storage.getItem(`profile:${preparedOfficeId}:family-office:book:1`);
  if (!raw) throw Error("The prepared financial book is missing. Reopen the office or recover its records before valuing this scope.");
  const investmentRaw = storage.getItem(`profile:${preparedOfficeId}:family-office:investment:1`);
  if (lastProjection?.book === raw && lastProjection.investment === investmentRaw) return lastProjection.value;
  const book = financeBookSchema.parse(JSON.parse(raw));
  let investments: InvestmentInput | null = null;
  if (investmentRaw) {
    const checked = investmentSchema.safeParse(JSON.parse(investmentRaw));
    if (checked.success) investments = checked.data;
  }
  const value = projectPreparedOffice(book, investments);
  lastProjection = { book: raw, investment: investmentRaw, value };
  return value;
}
