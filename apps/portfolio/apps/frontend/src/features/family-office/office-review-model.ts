import { z } from "zod";
import { cashForecast, consolidateBook, financeBookSchema } from "./finance-book-model";
import { governanceKey, governanceSchema } from "./governance-model";
import { loadSources } from "./source-model";
import { readEffectivePolicy } from "./policy-engine";
import { dateOnly, decodeOperations, operationsKey, type Obligation } from "./operations-model";

export const sourceDisplayStates = ["sample-loaded", "disconnected", "consent-required", "failed"] as const;
export const sourceProviders = ["Accounting source", "ERPNext", "Xero", "QuickBooks", "HMRC", "Trading source", "Trading 212"] as const;
const score = z.number().int().min(1).max(5).optional();
export const reviewMetadataSchema = z.object({
  findingId: z.string().min(1).max(200), owner: z.string().max(200), evidence: z.string().max(4000),
  severity: score, occurrence: score, detection: score,
  reviewedAt: z.string().datetime().optional(), actionId: z.string().optional(),
  observedFingerprint: z.string().max(10000).optional(),
});
export const officeReviewSchema = z.object({ schema: z.literal(1),
  reviews: z.array(reviewMetadataSchema).max(500),
  sources: z.array(z.object({ kind: z.enum(["accounting", "trading"]), provider: z.enum(sourceProviders),
    state: z.enum(sourceDisplayStates), note: z.string().max(2000) })).max(2),
}).superRefine((p,c)=>{
  if(new Set(p.reviews.map(r=>r.findingId)).size!==p.reviews.length)c.addIssue({code:"custom",message:"Review IDs must be unique."});
  if(new Set(p.sources.map(r=>r.kind)).size!==p.sources.length)c.addIssue({code:"custom",message:"Source kinds must be unique."});
});
export type OfficeReview = z.infer<typeof officeReviewSchema>;
export type ReviewMetadata = z.infer<typeof reviewMetadataSchema>;
export const officeReviewKey = (profile: string) => `profile:${profile}:office-review:v1`;
export const initialOfficeReview: OfficeReview = { schema: 1, reviews: [], sources: [
  { kind:"accounting",provider:"Accounting source",state:"sample-loaded",note:"" },
  { kind:"trading",provider:"Trading source",state:"sample-loaded",note:"" },
] };

export type OfficeFinding = { id:string; title:string; detail:string; status:"breach"|"missing"|"needs-review";
  source:string; sourceRoute:string; asOf?:string };
export type TradeEvidence = { count:number; needsReview:number; asOf:string; source:string };
type Store = Pick<Storage,"getItem"|"setItem"|"removeItem">;
export const findingFingerprint=(finding:OfficeFinding)=>JSON.stringify({id:finding.id,status:finding.status,detail:finding.detail,source:finding.source,asOf:finding.asOf});

/** Review metadata never changes the source statements, activities or policy. */
export function deriveOfficeFindings(store:Pick<Storage,"getItem">,profile:string,trades?:TradeEvidence):OfficeFinding[]{
  const findings:OfficeFinding[]=[];
  const bookKey=`profile:${profile}:family-office:book:1`,bookRaw=store.getItem(bookKey);
  if(bookRaw===null)findings.push({id:"book-missing",title:"Financial statements need population",detail:"No saved financial book is available for this family case.",status:"missing",source:bookKey,sourceRoute:"/office/finance"});
  else try{
    const b=financeBookSchema.parse(JSON.parse(bookRaw)),c=consolidateBook(b);
    c.errors.forEach((detail,i)=>findings.push({id:`book-reconciliation-${i}`,title:"Financial reconciliation exception",detail,status:"breach",source:b.source,sourceRoute:"/office/finance",asOf:b.asOf}));
    const gaps=cashForecast(b).filter(r=>r.headroom<-.01);
    if(gaps.length){const first=gaps[0];findings.push({id:"forecast-reserve-gap",title:"Forecast cash falls below the reserve",detail:`${gaps.length} entity/month records have negative reserve headroom. First: ${first.entity}, ${first.month}, ${first.headroom.toFixed(2)} ${b.currency}.`,status:"breach",source:b.source,sourceRoute:"/office/finance",asOf:b.asOf});}
  }catch(e){findings.push({id:"book-invalid",title:"Financial inputs need recovery",detail:String(e),status:"missing",source:bookKey,sourceRoute:"/office/finance"});}
  const governanceRaw=store.getItem(governanceKey(profile));
  if(governanceRaw===null)findings.push({id:"governance-missing",title:"Add family governance records",detail:"No saved ownership, decision-rights or continuity register is available for this case.",status:"missing",source:governanceKey(profile),sourceRoute:"/office/governance"});
  if(governanceRaw!==null)try{
    const g=governanceSchema.parse(JSON.parse(governanceRaw));
    for(const action of g.continuity.filter(a=>a.required&&a.status!=="complete"))findings.push({id:`continuity-${action.id}`,title:action.title,detail:`${action.status}; ${action.dueDate?`due ${action.dueDate}`:"due date not set"}. Completion evidence and prerequisite actions remain outstanding.`,status:"needs-review",source:action.source,sourceRoute:"/office/governance"});
  }catch(e){findings.push({id:"governance-invalid",title:"Governance inputs need recovery",detail:String(e),status:"missing",source:governanceKey(profile),sourceRoute:"/office/governance"});}
  try{
    const sources=loadSources(store,profile).sources;
    if(!sources.length)findings.push({id:"sources-missing",title:"Add the family constitution sources",detail:"No selected clause records are saved in this case.",status:"missing",source:"Constitution source register",sourceRoute:"/office/sources"});
    const drafts=sources.filter(s=>s.status!=="reviewed");
    if(drafts.length)findings.push({id:"sources-unreviewed",title:"Constitution clauses await review",detail:`${drafts.length} of ${sources.length} selected clauses are draft.`,status:"needs-review",source:"Constitution source register",sourceRoute:"/office/sources"});
  }catch(e){findings.push({id:"sources-invalid",title:"Constitution source records need recovery",detail:String(e),status:"missing",source:"Constitution source register",sourceRoute:"/office/sources"});}
  try{readEffectivePolicy(store,profile);}catch(e){findings.push({id:"policy-stale",title:"Constitution policy requires renewed review",detail:String(e),status:"breach",source:"Activated policy/source binding",sourceRoute:"/office/policy"});}
  if(trades?.needsReview)findings.push({id:"activities-review",title:"Portfolio activities need review",detail:`${trades.needsReview} of ${trades.count} host activity records carry a review flag.`,status:"needs-review",source:trades.source,sourceRoute:"/activities",asOf:trades.asOf});
  return findings;
}

/** The chosen review convention is explicit: three user-entered 1–5 scores. */
export function reviewRpn(review:Pick<ReviewMetadata,"severity"|"occurrence"|"detection">):number|null{
  if(review.severity===undefined||review.occurrence===undefined||review.detection===undefined)return null;
  return reviewMetadataSchema.pick({severity:true,occurrence:true,detection:true}).parse(review).severity! * review.occurrence * review.detection;
}

export function saveOfficeReview(store:Pick<Storage,"setItem">,profile:string,value:OfficeReview){
  const checked=officeReviewSchema.parse(value);store.setItem(officeReviewKey(profile),JSON.stringify(checked));return checked;
}

/** Append one linked operational action and save review metadata atomically. */
export function createOfficeReviewAction(store:Store,profile:string,state:OfficeReview,finding:OfficeFinding,review:ReviewMetadata){
  const checked=reviewMetadataSchema.parse(review);
  if(checked.findingId!==finding.id)throw new Error("Review metadata does not match the selected finding.");
  if(!checked.owner.trim()||!checked.evidence.trim())throw new Error("Name the action owner and record the review evidence first.");
  const opKey=operationsKey(profile),raw=store.getItem(opKey),operations=raw?decodeOperations(raw):{version:1 as const,obligations:[]};
  const workflowId=`office-review:${finding.id}`;
  const existing=operations.obligations.find(r=>r.workflowId===workflowId&&r.status==="Open");
  const id=existing?.id??crypto.randomUUID();
  const row:Obligation={id,title:/^(sources|policy)/.test(finding.id)?"please fix":`Resolve: ${finding.title}`,due:dateOnly(),owner:checked.owner.trim(),entity:"Family office",category:"Stewardship review",status:"Open",source:finding.source,sourceRoute:finding.sourceRoute,recurrence:"One-off",notes:`${finding.title}\n${finding.detail}\nReview: ${checked.evidence}`,evidence:"",scenario:false,workflowId};
  const next=officeReviewSchema.parse({...state,reviews:[...state.reviews.filter(r=>r.findingId!==finding.id),{...checked,actionId:id,reviewedAt:new Date().toISOString(),observedFingerprint:findingFingerprint(finding)}]});
  const oldReview=store.getItem(officeReviewKey(profile));
  try{
    store.setItem(opKey,JSON.stringify(decodeOperations(JSON.stringify({...operations,obligations:existing?operations.obligations:[...operations.obligations,row]}))));
    saveOfficeReview(store,profile,next);
  }catch(e){raw===null?store.removeItem(opKey):store.setItem(opKey,raw);oldReview===null?store.removeItem(officeReviewKey(profile)):store.setItem(officeReviewKey(profile),oldReview);throw e;}
  return {state:next,actionId:id,existing:!!existing};
}
