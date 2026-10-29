// Adapted from the user-supplied agent-authored policy module. See public/open-source/policy-module/NOTICE.md.
/**
 * Computational-linguistics layer for the constitution parser.
 *
 * Three stages run before pattern matching:
 *   1. normalizeNumberWords — spelled-out legal quantities become numerals and
 *      legal doublets ("25% (twenty-five percent)") collapse to one value.
 *   2. tokenize — POS + semantic lexicon tagging.
 *   3. reduce — a small context-free grammar over the tagged tokens.
 *
 * Everything is deterministic and dependency-free so it runs identically in the
 * browser, in a Bun build check, and inside a static export.
 */

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};

const SCALES: Record<string, number> = { hundred: 100, thousand: 1_000, million: 1_000_000, billion: 1_000_000_000 };

const FRACTIONS: Record<string, number> = {
  half: 0.5, halves: 0.5, third: 1 / 3, thirds: 1 / 3, quarter: 0.25, quarters: 0.25,
  fourth: 0.25, fourths: 0.25, fifth: 0.2, fifths: 0.2, eighth: 0.125, eighths: 0.125,
  tenth: 0.1, tenths: 0.1,
};

const NUMBER_WORD = new Set([...Object.keys(SMALL_NUMBERS), ...Object.keys(TENS), ...Object.keys(SCALES), ...Object.keys(FRACTIONS), "and", "a", "an"]);

/** Reduce a run of number words ("three and one-half", "twenty-five") to a value. */
function parseNumberRun(words: string[]): number | null {
  let total = 0;
  let current = 0;
  let sawValue = false;
  let pendingFractionNumerator: number | null = null;

  for (let index = 0; index < words.length; index += 1) {
    const word = words[index];
    if (word === "and") continue;

    if (word === "a" || word === "an") {
      // "a half" / "a quarter" only counts when a fraction follows.
      const next = words[index + 1];
      if (next && FRACTIONS[next] !== undefined) { current += FRACTIONS[next]; sawValue = true; index += 1; }
      continue;
    }

    if (SMALL_NUMBERS[word] !== undefined) {
      // "one-half" arrives as ["one","half"]: hold the numerator.
      if (words[index + 1] && FRACTIONS[words[index + 1]] !== undefined) {
        pendingFractionNumerator = SMALL_NUMBERS[word];
        continue;
      }
      current += SMALL_NUMBERS[word];
      sawValue = true;
      continue;
    }

    if (TENS[word] !== undefined) { current += TENS[word]; sawValue = true; continue; }

    if (FRACTIONS[word] !== undefined) {
      const numerator = pendingFractionNumerator ?? 1;
      current += numerator * FRACTIONS[word];
      pendingFractionNumerator = null;
      sawValue = true;
      continue;
    }

    if (SCALES[word] !== undefined) {
      const scale = SCALES[word];
      if (scale === 100) { current = (current || 1) * 100; }
      else { total += (current || 1) * scale; current = 0; }
      sawValue = true;
      continue;
    }

    return null;
  }

  if (!sawValue) return null;
  const value = total + current;
  return Number.isFinite(value) ? Math.round(value * 1e6) / 1e6 : null;
}

const DOUBLET_PATTERN = /(\d[\d,]*(?:\.\d+)?)(\s*(?:%|percent|percentage points?|months?|years?|days?))?\s*\(\s*([a-z][a-z\s\-]*?)\s*\)/gi;

/**
 * Collapse a legal doublet — a numeral immediately restated in words — when the
 * parenthetical says the same thing. Parentheticals that add meaning are kept.
 */
function collapseLegalDoublets(text: string): string {
  return text.replace(DOUBLET_PATTERN, (match, digits: string, unit: string | undefined, spelled: string) => {
    const words = spelled.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean);
    const unitWords = words.filter((word) => !NUMBER_WORD.has(word));
    const numberWords = words.filter((word) => NUMBER_WORD.has(word));
    if (numberWords.length === 0) return match;
    const spelledValue = parseNumberRun(numberWords);
    if (spelledValue === null) return match;

    const numeric = Number(digits.replace(/,/g, ""));
    if (!Number.isFinite(numeric)) return match;
    if (Math.abs(numeric - spelledValue) > 0.001) return match;

    // The words must not introduce a unit the numeral lacks.
    const numeralUnit = (unit ?? "").trim().toLowerCase();
    const spelledUnit = unitWords.join(" ").replace(/s$/, "");
    if (spelledUnit && numeralUnit && !numeralUnit.replace(/s$/, "").includes(spelledUnit) && !spelledUnit.includes(numeralUnit.replace(/s$/, "").replace("%", "percent"))) {
      return match;
    }
    return `${digits}${unit ?? ""}`;
  });
}

const NUMBER_RUN_PATTERN = /(?<![\d\-])\b((?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|billion|half|halves|third|thirds|quarter|quarters|fourth|fourths|fifth|fifths|eighth|eighths|tenth|tenths)(?:[-\s]+(?:and[-\s]+)?)?)+)\b/gi;

/**
 * Convert spelled-out English quantities into numerals so natural legal prose
 * yields measurable thresholds even when no digit is present.
 *
 *   "three and one-half percent"  → "3.5 percent"
 *   "twenty-five percent"         → "25 percent"
 *   "eighteen months"             → "18 months"
 *   "25% (twenty-five percent)"   → "25%"
 */
export function normalizeNumberWords(text: string): string {
  const collapsed = collapseLegalDoublets(text);
  return collapsed.replace(NUMBER_RUN_PATTERN, (match) => {
    const words = match.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean);
    // A bare "a"/"and" run carries no quantity.
    if (words.every((word) => word === "and")) return match;
    // A lone fraction word is almost always a period ("12-quarter", "quarter end"),
    // not a quantity. Only convert when a numerator makes it unambiguous.
    if (words.length === 1 && FRACTIONS[words[0]] !== undefined) return match;
    const value = parseNumberRun(words);
    if (value === null) return match;
    // Preserve a trailing space so "eighteen months" → "18 months".
    const trailing = /\s$/.test(match) ? " " : "";
    const rounded = Math.round(value * 1000) / 1000;
    return `${rounded}${trailing}`;
  });
}

export type PartOfSpeech = "NUM" | "UNIT" | "MODAL" | "VERB" | "NOUN" | "ADJ" | "PREP" | "DET" | "CONJ" | "PUNCT";
export type SemanticClass =
  | "ASSET" | "CONSTRAINT" | "THRESHOLD" | "APPROVAL" | "ENTITY" | "TAX" | "TIME" | "MONEY" | "NEGATION" | null;

export type LexToken = { text: string; pos: PartOfSpeech; semantic: SemanticClass };

const LEXICON: Array<{ pattern: RegExp; pos: PartOfSpeech; semantic: SemanticClass }> = [
  { pattern: /^(?:%|percent|percentage|points?|pp|bps|months?|years?|days?|usd|eur|gbp|cad|aud|jpy)$/i, pos: "UNIT", semantic: "THRESHOLD" },
  { pattern: /^(?:shall|must|may|can|will|should)$/i, pos: "MODAL", semantic: "CONSTRAINT" },
  { pattern: /^(?:not|no|never|without|except|unless)$/i, pos: "ADJ", semantic: "NEGATION" },
  { pattern: /^(?:exceed|exceeds|maintain|maintains|cap|caps|limit|limits|exclude|excludes|prohibit|prohibited|permit|permitted|require|requires|approve|approved|hold|holds|invest|allocate|distribute|rebalance|drift|drifts)$/i, pos: "VERB", semantic: "CONSTRAINT" },
  { pattern: /^(?:approval|approver|consent|authorisation|authorization|trustee|trustees)$/i, pos: "NOUN", semantic: "APPROVAL" },
  { pattern: /^(?:equity|equities|bond|bonds|cash|liquidity|illiquid|portfolio|asset|assets|allocation|exposure|position|holding|holdings|securities|security|coal|estate|art|collection|artwork)$/i, pos: "NOUN", semantic: "ASSET" },
  { pattern: /^(?:trust|trusts|holdco|company|companies|subsidiary|subsidiaries|foundation|partnership|entity|entities)$/i, pos: "NOUN", semantic: "ENTITY" },
  { pattern: /^(?:tax|taxes|taxation|exemption|exemptions|inheritance|gift|probate|domicile|residence|jurisdiction)$/i, pos: "NOUN", semantic: "TAX" },
  { pattern: /^(?:annual|annually|quarterly|monthly|trailing|forward)$/i, pos: "ADJ", semantic: "TIME" },
  { pattern: /^(?:of|in|on|at|to|from|within|per|above|below|under|over|between)$/i, pos: "PREP", semantic: null },
  { pattern: /^(?:the|a|an|any|each|every|its|their|this|that)$/i, pos: "DET", semantic: null },
  { pattern: /^(?:and|or|but|nor)$/i, pos: "CONJ", semantic: null },
  { pattern: /^[.,;:!?()]$/, pos: "PUNCT", semantic: null },
];

const TOKEN_PATTERN = /[$€£]\s?[\d,]+(?:\.\d+)?|\d[\d,]*(?:\.\d+)?|[A-Za-z][A-Za-z'-]*|%|[.,;:!?()]/g;

/** POS + semantic lexicon tagging over one clause. */
export function tokenize(sentence: string, limit = 48): LexToken[] {
  const raw = sentence.match(TOKEN_PATTERN) ?? [];
  return raw.slice(0, limit).map((text) => {
    if (/^[$€£]/.test(text)) return { text, pos: "NUM" as const, semantic: "MONEY" as const };
    if (/^\d/.test(text)) return { text, pos: "NUM" as const, semantic: "THRESHOLD" as const };
    const entry = LEXICON.find((candidate) => candidate.pattern.test(text));
    if (entry) return { text, pos: entry.pos, semantic: entry.semantic };
    return { text, pos: "NOUN" as const, semantic: null };
  });
}

export type GrammarReduction = { production: string; matched: string[] };

/**
 * A deliberately small context-free grammar. It documents *why* a clause
 * reduced the way it did, which is what the AST preview shows a principal.
 */
const PRODUCTIONS: Array<{ name: string; test: (tokens: LexToken[]) => boolean }> = [
  { name: "CONSTRAINT -> MODAL NEGATION VERB", test: (t) => hasSeq(t, ["MODAL", "NEGATION", "VERB"]) },
  { name: "CONSTRAINT -> MODAL VERB", test: (t) => hasSeq(t, ["MODAL", "VERB"]) },
  { name: "THRESHOLD -> NUM UNIT", test: (t) => hasSeq(t, ["NUM", "UNIT"]) },
  { name: "THRESHOLD -> MONEY", test: (t) => t.some((token) => token.semantic === "MONEY") },
  { name: "SUBJECT -> DET? NOUN[ASSET]", test: (t) => t.some((token) => token.semantic === "ASSET") },
  { name: "SUBJECT -> NOUN[ENTITY]", test: (t) => t.some((token) => token.semantic === "ENTITY") },
  { name: "APPROVAL -> NOUN[APPROVAL]", test: (t) => t.some((token) => token.semantic === "APPROVAL") },
  { name: "TAXCONTEXT -> NOUN[TAX]", test: (t) => t.some((token) => token.semantic === "TAX") },
];

function hasSeq(tokens: LexToken[], sequence: Array<PartOfSpeech | SemanticClass>): boolean {
  let cursor = 0;
  for (const token of tokens) {
    const want = sequence[cursor];
    if (token.pos === want || token.semantic === want) cursor += 1;
    if (cursor === sequence.length) return true;
  }
  return false;
}

export function reduce(tokens: LexToken[]): GrammarReduction[] {
  return PRODUCTIONS.filter((production) => production.test(tokens)).map((production) => ({
    production: production.name,
    matched: tokens.filter((token) => production.name.includes(String(token.semantic))).map((token) => token.text).slice(0, 4),
  }));
}
