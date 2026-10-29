// Adapted from the user-supplied agent-authored policy module. See public/open-source/policy-module/NOTICE.md.
import { z } from "zod";

import { normalizeNumberWords, reduce, tokenize } from "./nlp-engine";

const GateCategorySchema = z.enum([
  "Liquidity",
  "Asset allocation",
  "Concentration",
  "Private markets",
  "Responsible investment",
  "Leverage & approvals",
  "Distributions",
  "Principles",
]);

const GateFieldSchema = z.enum([
  "liquidityMonths",
  "allocationDriftPoints",
  "singlePositionPercent",
  "illiquidPercent",
  "restrictedRevenuePercent",
  "annualDistributionPercent",
  "borrowing",
  "assetExposurePercent",
  "assetExposureAmount",
  "principle",
]);

const ComparatorSchema = z.enum([
  "minimum",
  "maximum",
  "maximum-deviation",
  "target",
  "prohibited",
  "approval-required",
  "exclude-above",
  "principle",
]);

const UnitSchema = z.enum([
  "months",
  "percent",
  "percentage points",
  "boolean",
  "text",
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
]);

const CurrencySchema = z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]);
const ConstraintVerbSchema = z.enum([
  "at_least",
  "not_exceed",
  "deviation_within",
  "exclude_above",
  "prohibited",
  "approval_required",
  "target",
  "pending",
]);

const GateTraceSchema = z.object({
  normalized: z.string(),
  tokens: z.array(z.object({
    text: z.string(),
    pos: z.string(),
    semantic: z.string().nullable(),
  })),
  slots: z.object({
    asset: z.string().nullable(),
    verb: z.string(),
    value: z.number().nullable(),
    unit: z.string().nullable(),
  }),
  productions: z.array(z.string()),
  matcher: z.string().nullable(),
  grammar: z.string().nullable(),
});

const PolicyGateSchema = z.object({
  id: z.string(),
  trace: GateTraceSchema,
  sourceDocument: z.string(),
  sourceDocumentTitle: z.string(),
  category: GateCategorySchema,
  field: GateFieldSchema,
  comparator: ComparatorSchema,
  constraintVerb: ConstraintVerbSchema,
  recognitionStatus: z.enum(["executable", "pending"]),
  assetClass: z.string().nullable(),
  threshold: z.number().nullable(),
  unit: UnitSchema.nullable(),
  currency: CurrencySchema.nullable(),
  enforcement: z.enum(["hard gate", "approval gate", "guidance"]),
  statement: z.string(),
  section: z.string(),
  sourceLine: z.number().int().positive(),
  confidence: z.number().min(0).max(1),
  rationale: z.string(),
});

const PolicySectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  startLine: z.number().int().positive(),
  sourceDocument: z.string(),
});

const PolicyRuleSchema = z.object({
  id: z.string(),
  sourceDocument: z.string(),
  assetClass: z.string().nullable(),
  inputField: GateFieldSchema,
  comparator: ComparatorSchema,
  expression: z.string().nullable(),
  threshold: z.number().nullable(),
  unit: UnitSchema.nullable(),
  currency: CurrencySchema.nullable(),
  state: z.enum(["executable", "pending"]),
  onFailure: z.enum(["block", "review"]),
  rule: z.record(z.string(), z.unknown()).nullable(),
});

const PolicyRuleSetSchema = z.object({
  engine: z.literal("familybizness-policy-preview"),
  format: z.literal("json-conditions"),
  version: z.literal("1"),
  rules: z.array(PolicyRuleSchema),
});

export const PolicyDocumentSchema = z.object({
  schemaVersion: z.literal("2.1"),
  type: z.literal("family-investment-constitution"),
  title: z.string(),
  sections: z.array(PolicySectionSchema),
  gates: z.array(PolicyGateSchema),
  ruleSet: PolicyRuleSetSchema,
  summary: z.object({
    sectionCount: z.number().int().nonnegative(),
    recognizedGateCount: z.number().int().nonnegative(),
    guidanceCount: z.number().int().nonnegative(),
    approvalGateCount: z.number().int().nonnegative(),
    pendingRuleCount: z.number().int().nonnegative(),
  }),
});

export type PolicyGate = z.infer<typeof PolicyGateSchema>;
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;
export type PolicyRule = z.infer<typeof PolicyRuleSchema>;
export type GateEvaluation = {
  gateId: string;
  status: "pass" | "breach" | "review" | "not_configured" | "pending";
  observed: number | boolean | null;
  message: string;
};

export type PolicyMetrics = {
  liquidityMonths?: number;
  allocationDriftPoints?: number;
  singlePositionPercent?: number;
  illiquidPercent?: number;
  restrictedRevenuePercent?: number;
  annualDistributionPercent?: number;
  borrowing?: boolean;
  assetExposurePercent?: Record<string, number>;
  assetExposureAmount?: Record<string, number>;
  baseCurrency?: string;
  trusteeApproval?: boolean;
  emergencyException?: boolean;
};

const CURRENCY_CODES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"] as const;
type Currency = (typeof CURRENCY_CODES)[number];

type ParseSource = { id: string; label: string };
type ParsedLine = { statement: string; section: string; sourceLine: number; sourceDocument: string; sourceDocumentTitle: string };
type Constraint = { comparator: PolicyGate["comparator"]; verb: PolicyGate["constraintVerb"] };
type ParsedMeasurement = { amount: number; unit: PolicyGate["unit"]; currency: Currency | null };
type GateDraft = Omit<PolicyGate, "id" | "trace">;

const ASSET_CLASSES: Array<{ label: string; pattern: RegExp }> = [
  { label: "Venture capital", pattern: /\bventure capital\b|\bventure funds?\b/i },
  { label: "Private equity", pattern: /\bprivate equity\b/i },
  { label: "Real estate", pattern: /\b(?:direct\s+)?real estate\b|\bproperty\s+(?:assets?|holdings?)\b|\brealty\b/i },
  { label: "Cash & equivalents", pattern: /\bcash(?: and| &) equivalents?\b|\bshort[- ]duration government securities\b|\btreasury bills?\b|\bliquidity reserves?\b|\bcash\b/i },
  { label: "Fixed income", pattern: /\bfixed[- ]income\b|\bbonds?\b|\bcredit markets?\b/i },
  { label: "Technology equities", pattern: /\btech(?:nology)?(?:\s+(?:equities|stocks?|holdings?))?\b/i },
  { label: "Digital assets", pattern: /\bdigital assets?\b|\bcrypto(?:currency|currencies)?\b/i },
  { label: "Commodities", pattern: /\bcommodit(?:y|ies)\b|\bgold\b/i },
  { label: "Illiquid investments", pattern: /\billiquid investments?\b|\bprivate markets?\b|\balternatives?\b/i },
  { label: "Public equities", pattern: /\bpublic equities\b|\blisted equities\b|\bequities\b|\bequity(?: positions?| holdings?)?\b|\bstocks?\b/i },
  { label: "Thermal coal revenue", pattern: /\bthermal coal\b/i },
  { label: "Asset allocation", pattern: /\b(?:strategic )?asset allocation\b|\ballocation band\b/i },
  { label: "Family distributions", pattern: /\bdistributions?\b|\bwithdrawals?\b|\bspending draw\b/i },
  { label: "Portfolio leverage", pattern: /\bportfolio borrowing\b|\bleverage\b|\bmargin\b/i },
];

const MAXIMUM_PATTERN = /\b(?:shall|must|may|can)\s+not\s+exceed\b|\bnot\s+exceed\b|\bno\s+more\s+than\b|\bat\s+most\b|\bno\s+higher\s+than\b|\bexceed(?:s|ed)?\b|\bcap\b|\bmaximum\b|\bmax\b|\bceiling\b|\blimit(?:ed)?\s+(?:to|of)\b/i;
const MINIMUM_PATTERN = /\b(?:shall|must)\s+maintain\b|\bmaintain(?:s|ed)?\s+at\s+least\b|\bat\s+least\b|\bno\s+less\s+than\b|\bnot\s+less\s+than\b|\bminimum\b|\bfloor\b|\bkeep\s+at\s+least\b/i;
const TARGET_PATTERN = /\b(?:target|targeted|at the approved level|at its approved target)\b/i;
const EXCLUSION_PATTERN = /\b(?:exclude|exclusion|restricted|prohibit|prohibited|ban|banned)\b/i;
const APPROVAL_PATTERN = /\b(?:approval|approved|approver|authorize|authorise|consent|exception|review required)\b/i;

function slug(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section";
}

function cleanNumber(value: string) { return Number(value.replace(/,/g, "")); }

function multiplier(scale: string | undefined) {
  const normalized = scale?.toLowerCase();
  if (["b", "bn", "billion"].includes(normalized ?? "")) return 1_000_000_000;
  if (["m", "mn", "mm", "million"].includes(normalized ?? "")) return 1_000_000;
  if (["k", "thousand"].includes(normalized ?? "")) return 1_000;
  return 1;
}

function currencyFromCodeOrSymbol(code: string | undefined, symbol: string | undefined): Currency {
  if (code && CURRENCY_CODES.includes(code.toUpperCase() as Currency)) return code.toUpperCase() as Currency;
  if (symbol === "€") return "EUR";
  if (symbol === "£") return "GBP";
  return "USD";
}

function monetaryMeasurement(text: string): ParsedMeasurement | null {
  const coded = text.match(/\b(USD|EUR|GBP|CAD|AUD|JPY)\s*([$€£])?\s*(\d[\d,]*(?:\.\d+)?)\s*(billion|million|thousand|bn|mm|mn|m|k|b)?\b/i);
  if (coded) {
    const currency = currencyFromCodeOrSymbol(coded[1], coded[2]);
    return { amount: cleanNumber(coded[3]) * multiplier(coded[4]), unit: currency, currency };
  }
  const symbol = text.match(/([$€£])\s*(\d[\d,]*(?:\.\d+)?)\s*(billion|million|thousand|bn|mm|mn|m|k|b)?\b/i);
  if (symbol) {
    const currency = currencyFromCodeOrSymbol(undefined, symbol[1]);
    return { amount: cleanNumber(symbol[2]) * multiplier(symbol[3]), unit: currency, currency };
  }
  const words = text.match(/\b(\d[\d,]*(?:\.\d+)?)\s*(billion|million|thousand|bn|mm|mn|m|k|b)\s*(dollars?|euros?|pounds?)\b/i);
  if (words) {
    const denomination = words[3].toLowerCase();
    const currency: Currency = denomination.startsWith("euro") ? "EUR" : denomination.startsWith("pound") ? "GBP" : "USD";
    return { amount: cleanNumber(words[1]) * multiplier(words[2]), unit: currency, currency };
  }
  return null;
}

function measurementIn(text: string): ParsedMeasurement | null {
  const money = monetaryMeasurement(text);
  if (money) return money;
  const points = text.match(/(\d+(?:\.\d+)?)\s*(percentage\s+points?|pp\b)/i);
  if (points) return { amount: Number(points[1]), unit: "percentage points", currency: null };
  const percent = text.match(/\b(\d+(?:\.\d+)?)\s*(?:%|percent(?:age)?|per\s+cent)/i);
  if (percent) return { amount: Number(percent[1]), unit: "percent", currency: null };
  const basisPoints = text.match(/(\d+(?:\.\d+)?)\s*(?:basis\s+points?|bps)\b/i);
  if (basisPoints) return { amount: Number(basisPoints[1]) / 100, unit: "percentage points", currency: null };
  const months = text.match(/(\d+(?:\.\d+)?)\s*(?:months?|mos?)\b/i);
  if (months) return { amount: Number(months[1]), unit: "months", currency: null };
  return null;
}

function detectConstraint(text: string): Constraint | null {
  if (/\b(?:shall|must)\s+not\s+be\s+less\s+than\b/i.test(text)) return { comparator: "minimum", verb: "at_least" };
  if (/\b(?:shall|must|may|can)\s+not\s+exceed\b/i.test(text)) return { comparator: "maximum", verb: "not_exceed" };
  if (/\b(?:within|deviation|drift|rebalance)\b[^.!?]{0,100}\d+(?:\.\d+)?\s*(?:percentage\s+points?|pp\b)/i.test(text)) return { comparator: "maximum-deviation", verb: "deviation_within" };
  if (EXCLUSION_PATTERN.test(text)) return { comparator: "exclude-above", verb: "exclude_above" };
  if (MAXIMUM_PATTERN.test(text)) return { comparator: "maximum", verb: "not_exceed" };
  if (MINIMUM_PATTERN.test(text) || /\bmaintain\b/i.test(text)) return { comparator: "minimum", verb: "at_least" };
  if (TARGET_PATTERN.test(text)) return { comparator: "target", verb: "target" };
  if (/\b(?:no|never|not permitted|must not|forbid|forbidden)\b/i.test(text)) return { comparator: "prohibited", verb: "prohibited" };
  if (APPROVAL_PATTERN.test(text)) return { comparator: "approval-required", verb: "approval_required" };
  return null;
}

function assetClassIn(text: string) {
  for (const asset of ASSET_CLASSES) {
    if (asset.pattern.test(text)) return asset.label;
  }
  if (/\b(?:family|portfolio|investable assets?|capital)\b/i.test(text)) return "Portfolio";
  return null;
}

function categoryFor(assetClass: string | null): PolicyGate["category"] {
  if (!assetClass) return "Principles";
  if (/cash|liquid|reserve/i.test(assetClass)) return "Liquidity";
  if (/single|concentration/i.test(assetClass)) return "Concentration";
  if (/private|venture|real estate|illiquid/i.test(assetClass)) return "Private markets";
  if (/coal/i.test(assetClass)) return "Responsible investment";
  if (/leverage|borrowing|margin/i.test(assetClass)) return "Leverage & approvals";
  if (/distribution/i.test(assetClass)) return "Distributions";
  return "Asset allocation";
}

function makeGate(record: ParsedLine, details: Omit<GateDraft, "statement" | "section" | "sourceLine" | "confidence" | "sourceDocument" | "sourceDocumentTitle" | "trace">): GateDraft {
  return {
    ...details,
    sourceDocument: record.sourceDocument,
    sourceDocumentTitle: record.sourceDocumentTitle,
    statement: record.statement,
    section: record.section,
    sourceLine: record.sourceLine,
    confidence: details.recognitionStatus === "executable" ? 0.94 : 0.68,
  };
}

function parseGate(record: ParsedLine): GateDraft {
  // Spelled-out legal quantities become numerals before any pattern matching.
  const text = normalizeNumberWords(record.statement.trim());
  const lower = text.toLowerCase();
  const assetClass = assetClassIn(text);
  const measurement = measurementIn(text);
  const constraint = detectConstraint(lower);

  // A threshold alone cannot resolve an event, exception or approval condition.
  if (/\b(?:if|unless|except|subject to|provided that|when)\b/i.test(text)) {
    return makeGate(record, {
      category: categoryFor(assetClass), field: "principle", comparator: "principle", constraintVerb: "pending", recognitionStatus: "pending",
      assetClass, threshold: measurement?.amount ?? null, unit: measurement?.unit ?? "text", currency: measurement?.currency ?? null,
      enforcement: "guidance", rationale: "The condition needs an explicit event or approval source before this clause can be evaluated.",
    });
  }

  if (/\b(borrow|borrowing|margin|leverage)\b/.test(lower)) {
    const approvalNeeded = APPROVAL_PATTERN.test(lower);
    const prohibited = /\b(no|never|not permitted|shall not|must not|prohibit|forbid)\b/i.test(lower);
    if (approvalNeeded || prohibited) {
      return makeGate(record, {
        category: "Leverage & approvals",
        field: "borrowing",
        comparator: approvalNeeded ? "approval-required" : "prohibited",
        constraintVerb: approvalNeeded ? "approval_required" : "prohibited",
        recognitionStatus: "executable",
        assetClass: "Portfolio leverage",
        threshold: null,
        unit: "boolean",
        currency: null,
        enforcement: approvalNeeded ? "approval gate" : "hard gate",
        rationale: approvalNeeded ? "Borrowing requires an explicit approval check before execution." : "Borrowing activity is disallowed by the written policy.",
      });
    }
  }

  if (/\b(distribution|distributions|withdrawal|withdrawals|spending draw)\b/.test(lower) && measurement?.unit === "percent" && constraint) {
    return makeGate(record, {
      category: "Distributions", field: "annualDistributionPercent", comparator: "maximum", constraintVerb: "not_exceed", recognitionStatus: "executable",
      assetClass: "Family distributions", threshold: measurement.amount, unit: "percent", currency: null, enforcement: "hard gate",
      rationale: "Annual family distributions are checked against the stated portfolio-value ceiling.",
    });
  }

  if (/\b(liquid|liquidity|cash reserve|reserve|family spending)\b/.test(lower) && measurement?.unit === "months" && constraint) {
    return makeGate(record, {
      category: "Liquidity", field: "liquidityMonths", comparator: "minimum", constraintVerb: "at_least", recognitionStatus: "executable",
      assetClass: "Cash & equivalents", threshold: measurement.amount, unit: "months", currency: null, enforcement: "hard gate",
      rationale: "Liquid reserves are checked against the minimum months of spending specified here.",
    });
  }

  if (/\b(allocation|rebalance|target|drift|band)\b/.test(lower) && measurement?.unit === "percentage points" && constraint) {
    return makeGate(record, {
      category: "Asset allocation", field: "allocationDriftPoints", comparator: "maximum-deviation", constraintVerb: "deviation_within", recognitionStatus: "executable",
      assetClass: "Strategic asset allocation", threshold: measurement.amount, unit: "percentage points", currency: null, enforcement: "hard gate",
      rationale: "Allocation drift is measured in percentage points from the approved strategic target.",
    });
  }

  if (/\b(illiquid|private markets?|private equity|venture capital|direct real estate|alternatives)\b/.test(lower) && measurement?.unit === "percent" && constraint) {
    return makeGate(record, {
      category: "Private markets", field: "illiquidPercent", comparator: constraint.comparator, constraintVerb: constraint.verb, recognitionStatus: "executable",
      assetClass: "Illiquid investments", threshold: measurement.amount, unit: "percent", currency: null, enforcement: "hard gate",
      rationale: "Aggregate illiquid exposure is checked against the stated percentage boundary.",
    });
  }

  if (/\b(single|individual|one)\s+(?:public\s+)?(?:equity|holding|position)\b|\bconcentration\b|\bposition size\b/.test(lower) && measurement?.unit === "percent" && constraint) {
    return makeGate(record, {
      category: "Concentration", field: "singlePositionPercent", comparator: "maximum", constraintVerb: "not_exceed", recognitionStatus: "executable",
      assetClass: "Single public equity position", threshold: measurement.amount, unit: "percent", currency: null, enforcement: "hard gate",
      rationale: "A single position is checked against its maximum share of investable assets.",
    });
  }

  if (/\b(exclude|exclusion|restricted|thermal coal|prohibit)\b/.test(lower) && measurement?.unit === "percent" && constraint) {
    return makeGate(record, {
      category: "Responsible investment", field: "restrictedRevenuePercent", comparator: "exclude-above", constraintVerb: "exclude_above", recognitionStatus: "executable",
      assetClass: "Thermal coal revenue", threshold: measurement.amount, unit: "percent", currency: null, enforcement: "hard gate",
      rationale: "A company crossing the stated restricted-revenue threshold is flagged for exclusion.",
    });
  }

  if (assetClass && constraint && measurement) {
    const isMonetary = measurement.currency !== null;
    return makeGate(record, {
      category: categoryFor(assetClass),
      field: isMonetary ? "assetExposureAmount" : "assetExposurePercent",
      comparator: constraint.comparator === "exclude-above" ? "maximum" : constraint.comparator,
      constraintVerb: constraint.verb === "exclude_above" ? "not_exceed" : constraint.verb,
      recognitionStatus: "executable",
      assetClass,
      threshold: measurement.amount,
      unit: measurement.unit,
      currency: measurement.currency,
      enforcement: constraint.comparator === "approval-required" ? "approval gate" : "hard gate",
      rationale: `${assetClass} exposure is evaluated against the extracted ${isMonetary ? "monetary" : "numeric"} threshold.`,
    });
  }

  const generalAssetClass = assetClass ?? (measurement ? "Portfolio" : null);
  return makeGate(record, {
    category: categoryFor(generalAssetClass), field: "principle", comparator: "principle", constraintVerb: "pending", recognitionStatus: "pending",
    assetClass: generalAssetClass, threshold: measurement?.amount ?? null, unit: measurement?.unit ?? "text", currency: measurement?.currency ?? null,
    enforcement: "guidance",
    rationale: "No supported asset, constraint, and threshold pattern has been identified yet. This clause remains in the draft queue for rule definition.",
  });
}

export function humanExpression(gate: PolicyGate): string | null {
  if (gate.recognitionStatus === "pending") return null;
  const field = gate.field === "assetExposurePercent" || gate.field === "assetExposureAmount"
    ? `${gate.assetClass ?? "asset"} exposure`
    : gate.field.replace(/([A-Z])/g, " $1").toLowerCase();
  if (gate.comparator === "prohibited") return `${field} = false`;
  if (gate.comparator === "approval-required") return `${field} requires approval`;
  if (gate.threshold === null) return null;
  const operator = gate.comparator === "minimum" ? ">=" : gate.comparator === "target" ? "=" : "<=";
  const unit = gate.currency ?? (gate.unit === "percent" ? "%" : gate.unit === "percentage points" ? "pp" : gate.unit ?? "");
  return `${field} ${operator} ${gate.threshold}${unit ? ` ${unit}` : ""}`;
}

function buildRuleSet(gates: PolicyGate[]): PolicyDocument["ruleSet"] {
  return {
    engine: "familybizness-policy-preview",
    format: "json-conditions",
    version: "1",
    rules: gates.map((gate) => ({
      id: gate.id,
      sourceDocument: gate.sourceDocument,
      assetClass: gate.assetClass,
      inputField: gate.field,
      comparator: gate.comparator,
      expression: humanExpression(gate),
      threshold: gate.threshold,
      unit: gate.unit,
      currency: gate.currency,
      state: gate.recognitionStatus,
      onFailure: gate.enforcement === "hard gate" ? "block" : "review",
      rule: null,
    })),
  };
}

function splitSentences(statement: string) {
  return statement.split(/(?<=[.!?])\s+(?=[A-Z0-9“"'])/).map((part) => part.trim()).filter(Boolean);
}

/** A clause that governs money, not paperwork. */
const INVESTMENT_SUBJECT_PATTERN = /\b(invest(?:ment|ments|able)?|portfolio|asset(?:s| class| classes)?|allocation|exposure|position|holding|holdings|equit(?:y|ies)|bond|bonds|cash|liquid(?:ity)?|illiquid|real estate|private equity|venture|distribution|borrowing|leverage|margin|diversif\w*|commitment|security|securities|issuer|fund|funds)\b/i;
/** Administrative duties a principal should never be asked to turn into a limit. */
const ADMINISTRATIVE_PATTERN = /\b(records?|register|minutes?|agenda|notice|meeting|meet\b|report(?:s|ing)?|appoint(?:ment|s)?|amendment|amend|access|confidential|revision|revisions|copy|copies|adviser|advisers|manager|managers|custodian|written|document(?:ed|ation)?|criteria|calendar|stewardship report|means\b|review(?:s|ed)?|authority|diligence|judgment|duty|duties|conflict)\b/i;
/** Absolute prohibitions are always rules, even without a number to read. */
const HARD_PROHIBITION_PATTERN = /\b(?:is|are)\s+prohibited\b|\b(?:shall|must|may)\s+not\s+exceed\b/i;

/**
 * Only surface clauses that look like they were *meant* to be an investment
 * rule but are missing a measurable threshold. Narrative, definitional and
 * administrative prose stays in the document instead of becoming a confusing
 * "needs a rule" flag for a non-technical principal.
 */
const NUMBERED_CLAUSE_PATTERN = /^\s*(?:[-*+]\s+|\d+(?:\.\d+)*[.)]?\s+)/;

function isPolicyCandidate(raw: string) {
  const sentence = normalizeNumberWords(raw);
  if (measurementIn(sentence)) return false;
  if (!detectConstraint(sentence.toLowerCase())) return false;
  if (!INVESTMENT_SUBJECT_PATTERN.test(sentence)) return false;
  if (ADMINISTRATIVE_PATTERN.test(sentence)) return false;
  return true;
}

function extractLines(content: string, source: ParseSource) {
  const lines = content.split(/\r?\n/);
  const records: ParsedLine[] = [];
  const sections: PolicyDocument["sections"] = [];
  let currentSection = "Opening statement";
  let currentSectionLine = 1;
  let currentSectionBody: string[] = [];
  let title = "Family investment constitution";
  let fenced = false;

  const finishSection = () => {
    const body = currentSectionBody.join("\n").trim();
    if (body) sections.push({ id: slug(currentSection), title: currentSection, body, startLine: currentSectionLine, sourceDocument: source.id });
    currentSectionBody = [];
  };

  lines.forEach((rawLine, index) => {
    const lineNumber = index + 1;
    if (/^\s*(```|~~~)/.test(rawLine)) { fenced = !fenced; currentSectionBody.push(rawLine); return; }
    if (fenced) { currentSectionBody.push(rawLine); return; }
    const heading = rawLine.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      finishSection();
      const headingText = heading[2].trim();
      if (heading[1].length === 1) {
        title = headingText;
        currentSection = "Opening statement";
      } else {
        currentSection = headingText;
      }
      currentSectionLine = lineNumber;
      return;
    }
    currentSectionBody.push(rawLine);
    const statement = rawLine.replace(NUMBERED_CLAUSE_PATTERN, "").replace(/\*\*(.*?)\*\*/g, "$1").trim();
    if (!statement || /^\s*`{3}/.test(statement) || /^\s*\|/.test(statement) || /^\|?\s*:?-{3,}/.test(statement)) return;
    for (const sentence of splitSentences(statement)) {
      const normalized = normalizeNumberWords(sentence);
      const measured = measurementIn(normalized) !== null;
      const constrained = detectConstraint(normalized.toLowerCase()) !== null;
      if ((measured && constrained) || HARD_PROHIBITION_PATTERN.test(normalized) || isPolicyCandidate(sentence)) {
        records.push({ statement: sentence, section: currentSection, sourceLine: lineNumber, sourceDocument: source.id, sourceDocumentTitle: source.label });
      }
    }
  });
  finishSection();
  return { title, sections, records };
}

/** Names the syntactic pattern family that fired for a clause. */
function matcherLabel(gate: PolicyGate): string | null {
  if (gate.recognitionStatus !== "executable") return null;
  const unit = gate.unit ?? "text";
  switch (gate.comparator) {
    case "approval-required": return "BINARY/approval-required";
    case "prohibited": return "BINARY/prohibited";
    case "minimum": return `MEASUREMENT/min-${unit}`;
    case "maximum-deviation": return "MEASUREMENT/deviation-band";
    case "exclude-above": return `EXCLUSION/max-${unit}`;
    case "target": return `MEASUREMENT/target-${unit}`;
    default: return `MEASUREMENT/max-${unit}`;
  }
}

/** The context-free production the clause was reduced to. */
function grammarLabel(gate: PolicyGate): string | null {
  if (gate.recognitionStatus !== "executable") return "CLAUSE -> (unrecognised segment)";
  if (gate.comparator === "approval-required" || gate.comparator === "prohibited") {
    return `CLAUSE -> NP[${gate.assetClass ?? gate.category}] VP[${gate.constraintVerb}]`;
  }
  if (gate.threshold === null) return `CLAUSE -> NP[${gate.assetClass ?? gate.category}] VP[${gate.constraintVerb}]`;
  const value = `${gate.threshold}${gate.unit === "percent" ? "%" : ` ${gate.unit ?? ""}`}`.trim();
  return `CLAUSE -> NP[${gate.assetClass ?? gate.category}] VP[${gate.constraintVerb}] NP[${value}]`;
}

export function parseConstitution(content: string, source: ParseSource = { id: "constitution", label: "Family constitution" }): PolicyDocument {
  const { title, sections, records } = extractLines(content, source);
  const gates: PolicyGate[] = records.map((record, index) => {
    const draft = parseGate(record);
    const normalized = normalizeNumberWords(draft.statement);
    const lexTokens = tokenize(normalized);
    const trace = {
      normalized,
      tokens: lexTokens.map((token) => ({ text: token.text, pos: token.pos, semantic: token.semantic })),
      slots: { asset: draft.assetClass, verb: draft.constraintVerb, value: draft.threshold, unit: draft.unit },
      productions: reduce(lexTokens).map((entry) => entry.production),
      matcher: matcherLabel(draft as PolicyGate),
      grammar: grammarLabel(draft as PolicyGate),
    };
    return { ...draft, trace, id: `${source.id}-${slug(draft.category)}-${record.sourceLine}-${index + 1}` };
  });
  const typedSections = sections.map((section) => ({ ...section, id: `${source.id}-${section.id}` }));

  return PolicyDocumentSchema.parse({
    schemaVersion: "2.1",
    type: "family-investment-constitution",
    title,
    sections: typedSections,
    gates,
    ruleSet: buildRuleSet(gates),
    summary: {
      sectionCount: sections.filter((section) => section.title !== "Opening statement").length || sections.length,
      recognizedGateCount: gates.filter((gate) => gate.recognitionStatus === "executable").length,
      guidanceCount: gates.filter((gate) => gate.enforcement === "guidance").length,
      approvalGateCount: gates.filter((gate) => gate.enforcement === "approval gate").length,
      pendingRuleCount: gates.filter((gate) => gate.recognitionStatus === "pending").length,
    },
  });
}

export function observedForGate(gate: PolicyGate, metrics: PolicyMetrics): number | boolean | null {
  switch (gate.field) {
    case "liquidityMonths": return metrics.liquidityMonths ?? null;
    case "allocationDriftPoints": return metrics.allocationDriftPoints ?? null;
    case "singlePositionPercent": return metrics.singlePositionPercent ?? null;
    case "illiquidPercent": return metrics.illiquidPercent ?? null;
    case "restrictedRevenuePercent": return metrics.restrictedRevenuePercent ?? null;
    case "annualDistributionPercent": return metrics.annualDistributionPercent ?? null;
    case "borrowing": return metrics.borrowing ?? null;
    case "assetExposurePercent": return metrics.assetExposurePercent?.[gate.assetClass ?? ""] ?? null;
    case "assetExposureAmount": return metrics.assetExposureAmount?.[gate.assetClass ?? ""] ?? null;
    case "principle": return null;
  }
}

function formatThreshold(gate: PolicyGate) {
  if (gate.threshold === null) return "the stated prohibition";
  if (gate.currency) return new Intl.NumberFormat("en", { style: "currency", currency: gate.currency, notation: "compact", maximumFractionDigits: 1 }).format(gate.threshold);
  return `${gate.threshold}${gate.unit === "percent" ? "%" : gate.unit ? ` ${gate.unit}` : ""}`;
}

export function evaluatePolicy(document: PolicyDocument, metrics: PolicyMetrics): GateEvaluation[] {
  return document.gates.map((gate) => {
    const observed = observedForGate(gate, metrics);
    const result = (status: GateEvaluation["status"], message: string): GateEvaluation => ({ gateId: gate.id, status, observed, message });
    if (gate.recognitionStatus === "pending" || gate.comparator === "principle") return result("pending", "Pending rule definition. This clause is preserved but is not executable yet.");
    if (observed === null || (typeof observed === "number" && !Number.isFinite(observed))) return result("not_configured", `Provide an observation for ${gate.assetClass ?? gate.category} to evaluate this rule.`);
    if (gate.currency && gate.currency !== metrics.baseCurrency) return result("not_configured", `Convert portfolio values to ${gate.currency} before applying this monetary limit.`);
    if (gate.comparator === "approval-required") {
      if (observed === false) return result("pass", "No borrowing is present; no approval is needed.");
      return metrics.trusteeApproval ? result("pass", "Borrowing is present and trustee approval is recorded.") : result("review", "Borrowing requires trustee approval before execution.");
    }
    if (typeof observed === "boolean") return observed ? result("breach", "Prohibited activity is present.") : result("pass", "No prohibited activity is present.");
    if (gate.threshold === null) return result("pending", "This clause needs a supported executable threshold.");
    const passes = gate.comparator === "minimum" ? observed >= gate.threshold : gate.comparator === "target" ? observed === gate.threshold : observed <= gate.threshold;
    if (passes) return result("pass", `${gate.assetClass ?? gate.category} is within the ${formatThreshold(gate)} policy boundary.`);
    if (gate.field === "annualDistributionPercent" && metrics.emergencyException) return result("review", "Above the distribution limit; a documented family exception needs review.");
    return result(gate.enforcement === "hard gate" ? "breach" : "review", `${gate.assetClass ?? gate.category} is outside the ${formatThreshold(gate)} policy boundary.`);
  });
}
