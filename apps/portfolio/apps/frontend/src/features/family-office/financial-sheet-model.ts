import { consolidateBook, fairValueWealth, type FinanceBook } from "./finance-book-model";

export type FinancialSheetRow = { id: string; label: string; values: number[]; total?: boolean };
export type FinancialSheet = { id: "summary" | "balance" | "income" | "cash"; title: string; rows: FinancialSheetRow[] };

/** A presentation projection of the existing ledger and consolidation result.
 * Native records are translated with their owning model's opening/average/closing
 * rates. The adjustment column is the difference from its consolidated result. */
export function buildFinancialSheets(book: FinanceBook) {
  const consolidated = consolidateBook(book);
  const wealth = fairValueWealth(book);
  const rate = (currency: string, basis: "opening" | "average" | "closing") => book.fx.find(row => row.currency === currency)![basis];
  const entityValues = (read: (entity: string) => number) => book.entities.map(entity => read(entity.id));
  const row = (id: string, label: string, values: number[], group: number, total = false): FinancialSheetRow => ({ id, label, values: [...values, group - values.reduce((sum, value) => sum + value, 0), group], total });
  const balance = (kind: "asset" | "liability" | "equity", category?: string) => {
    const values = entityValues(entity => book.balances.filter(item => item.entity === entity && item.kind === kind && (!category || item.category === category)).reduce((sum, item) => sum + item.amount * rate(item.currency, "closing"), 0));
    const group = consolidated.balances.filter(item => item.kind === kind && (!category || item.category === category)).reduce((sum, item) => sum + item.base, 0);
    return { values, group };
  };
  const balanceRow = (id: string, label: string, kind: "asset" | "liability" | "equity", category?: string, total = false) => { const values = balance(kind, category); return row(id, label, values.values, values.group, total); };
  const income = (kind: "income" | "expense") => {
    const sign = kind === "expense" ? -1 : 1;
    return { values: entityValues(entity => book.income.filter(item => item.entity === entity && item.kind === kind).reduce((sum, item) => sum + sign * item.amount * rate(item.currency, "average"), 0)), group: consolidated.income.filter(item => item.kind === kind).reduce((sum, item) => sum + sign * item.base, 0) };
  };
  const movement = (category?: "operating" | "investing" | "financing") => ({ values: entityValues(entity => book.movements.filter(item => item.entity === entity && (!category || item.category === category)).reduce((sum, item) => sum + item.amount * rate(item.currency, "average"), 0)), group: consolidated.flows.filter(item => !category || item.category === category).reduce((sum, item) => sum + item.base, 0) });
  const receipts = income("income"), expenses = income("expense"), cashMovement = movement();
  const openingCash = book.entities.map(entity => entity.openingCash * rate(entity.currency, "opening"));
  const translation = book.entities.map(entity => consolidated.entityChecks.find(check => check.id === entity.id)!.fxTranslation);
  const profits = book.entities.map(entity => consolidated.entityChecks.find(check => check.id === entity.id)!.profit);
  const netAssets = book.entities.map(entity => book.balances.filter(item => item.entity === entity.id && item.kind !== "equity").reduce((sum, item) => sum + item.amount * rate(item.currency, "closing") * (item.kind === "asset" ? 1 : -1), 0));
  const sheets: FinancialSheet[] = [
    { id: "summary", title: "Three-statement summary", rows: [
      balanceRow("assets", "Total book assets", "asset", undefined, true),
      balanceRow("liabilities", "Total liabilities", "liability"),
      row("net-assets", "Consolidated book capital", netAssets, consolidated.netWorth, true),
      row("net-income", "Net income for the period", profits, consolidated.netIncome, true),
      row("cash-movement", "Net cash movement", cashMovement.values, cashMovement.group),
      balanceRow("closing-cash", "Closing cash", "asset", "cash", true),
    ] },
    { id: "balance", title: "Balance sheet", rows: [
      balanceRow("cash", "Cash and cash equivalents", "asset", "cash"),
      balanceRow("listed", "Listed investments", "asset", "listed"),
      balanceRow("private", "Private investments and subsidiaries", "asset", "private"),
      balanceRow("operating", "Operating property and assets", "asset", "operating"),
      balanceRow("receivables", "Loans and receivables", "asset", "receivable"),
      balanceRow("total-assets", "Total assets", "asset", undefined, true),
      balanceRow("debt", "Borrowings", "liability", "debt"),
      balanceRow("payables", "Trade and intercompany payables", "liability", "payable"),
      balanceRow("total-liabilities", "Total liabilities", "liability", undefined, true),
      row("net-assets", "Net assets", netAssets, consolidated.netWorth, true),
      balanceRow("equity", "Share capital and reserves", "equity", undefined, true),
      row("balance-check", "Balance reconciliation difference", consolidated.entityChecks.map(check => check.balance), consolidated.balanceResidual),
    ] },
    { id: "income", title: "Income statement", rows: [
      row("revenue", "Revenue and investment income", receipts.values, receipts.group),
      row("expenses", "Operating expenses, grants and tax", expenses.values, expenses.group),
      row("profit", "Net income for the period", profits, consolidated.netIncome, true),
    ] },
    { id: "cash", title: "Cash-flow statement", rows: [
      row("opening", "Opening cash", openingCash, openingCash.reduce((sum, value) => sum + value, 0), true),
      ...(["operating", "investing", "financing"] as const).map(category => { const values = movement(category); return row(category, `Net ${category} cash flow`, values.values, values.group); }),
      row("movement", "Net movement in cash", cashMovement.values, cashMovement.group, true),
      row("translation", "Exchange-rate translation", translation, translation.reduce((sum, value) => sum + value, 0)),
      balanceRow("closing", "Closing cash", "asset", "cash", true),
      row("cash-check", "Cash reconciliation difference", consolidated.entityChecks.map(check => check.cashResidual), consolidated.entityChecks.reduce((sum, check) => sum + check.cashResidual, 0)),
    ] },
  ];
  return { sheets, consolidated, wealth, columns: [...book.entities.map(entity => ({ id: entity.id, name: entity.name, restricted: entity.restrictedCash })), { id: "adjustments", name: "Consolidation adjustments", restricted: false }, { id: "group", name: "Consolidated group", restricted: false }] };
}
