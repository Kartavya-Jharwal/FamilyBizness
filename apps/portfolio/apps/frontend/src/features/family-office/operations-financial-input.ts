import { financeSchema, financeDefaults, type FinanceInput } from "./finance-model";
import { financeBookSchema, consolidateBook } from "./finance-book-model";
/** Read one owner's budget/cash facts. A saved statement book takes precedence over the legacy planning form. */
export function capitalFinanceInput(store:Pick<Storage,"getItem">,profile:string,budgetYear?:number):FinanceInput & {budgetYear:number}{
 const bookRaw=store.getItem(`profile:${profile}:family-office:book:1`);
 if(bookRaw!==null){
  const book=financeBookSchema.parse(JSON.parse(bookRaw)),c=consolidateBook(book);
  if(c.errors.length)throw new Error(`Reconcile the Financials book before capital approvals: ${c.errors.join("; ")}`);
  const year=String(budgetYear??Number(book.forecast[0]?.month.slice(0,4)??book.asOf.slice(0,4))),forecast=book.forecast.filter(r=>r.month.startsWith(year)&&book.wealthOwnerIds.includes(r.entity)&&!book.entities.find(e=>e.id===r.entity)!.restrictedCash);
  if(!forecast.length)throw new Error(`Populate ${year} capital-use forecasts in Financials before approving commitments.`);
  const rate=(currency:string)=>book.fx.find(r=>r.currency===currency)!.closing;
  const total=(key:"philanthropy"|"ventures")=>forecast.reduce((s,r)=>s+r[key]*rate(r.currency),0);
  const reserveByMonth=new Map<string,number>();for(const row of forecast)reserveByMonth.set(row.month,(reserveByMonth.get(row.month)??0)+row.reserve*rate(row.currency));
  const cash=c.entityChecks.filter(e=>book.wealthOwnerIds.includes(e.id)&&!e.restricted).reduce((sum,e)=>sum+e.closingCash,0);
  return {...financeDefaults,budgetYear:Number(year),currency:book.currency,source:`${book.source}; budgets from ${year} forecasts of family wealth owners; cash from those entities only`,asOf:book.asOf,cash,philanthropy:total("philanthropy"),ventures:total("ventures"),successionReserve:Math.max(0,...reserveByMonth.values())};
 }
 const legacy=store.getItem(`profile:${profile}:family-office:finance:1`);
 if(legacy===null)throw new Error("Save a Financials statement book and capital-use forecast before approving capital. No sample budget is silently assumed.");
 const value=financeSchema.parse(JSON.parse(legacy));return {...value,budgetYear:Number(value.asOf.slice(0,4))};
}
