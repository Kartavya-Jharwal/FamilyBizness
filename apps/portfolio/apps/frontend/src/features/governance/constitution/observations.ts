/** Host-owned intake boundary. This does not extract or evaluate policy rules. */
export interface ObservationRequirement {
  metric: string;
  unit: string;
  scopeId: string;
  asOf: string;
  currency?: string;
  denominator?: string;
}

export interface PolicyObservation extends ObservationRequirement {
  value: number | boolean;
  source: string;
  coverage: number;
  basis: "host" | "illustrative";
}

export type ObservationRead =
  | { state: "available"; observation: PolicyObservation }
  | { state: "unavailable"; reason: string };

const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/** Require explicitly matching evidence; never substitute a sample or a zero. */
export function readPolicyObservation(
  input: unknown,
  required: ObservationRequirement,
): ObservationRead {
  const unavailable = (reason: string): ObservationRead => ({ state: "unavailable", reason });
  if (!nonempty(required.metric) || !nonempty(required.unit) || !nonempty(required.scopeId) || !validDate(required.asOf)) {
    return unavailable("The requested metric, unit, scope and date must be defined.");
  }
  if (required.unit === "currency" && required.currency === undefined) {
    return unavailable("Monetary observations require an explicit currency.");
  }
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return unavailable("No observation has been supplied.");
  }
  const candidate = input as Record<string, unknown>;
  if (candidate.basis !== "host") return unavailable("Illustrative figures are not host observations.");
  if (!nonempty(candidate.source)) return unavailable("The observation has no source.");
  if (candidate.metric !== required.metric || candidate.unit !== required.unit) {
    return unavailable("The metric or unit does not match the requested observation.");
  }
  if (candidate.scopeId !== required.scopeId) return unavailable("The observation belongs to a different scope.");
  if (!validDate(candidate.asOf) || candidate.asOf !== required.asOf) return unavailable("The observation date does not match.");
  if (candidate.coverage !== 1) return unavailable("Complete coverage has not been established.");
  if (required.currency !== undefined && (!/^[A-Z]{3}$/.test(required.currency) || candidate.currency !== required.currency)) {
    return unavailable("A matching observation currency is required; no conversion is performed.");
  }
  if (required.denominator !== undefined && (!nonempty(required.denominator) || candidate.denominator !== required.denominator)) {
    return unavailable("The observation denominator does not match.");
  }
  const value = candidate.value;
  if (typeof value !== "boolean" && (typeof value !== "number" || !Number.isFinite(value))) {
    return unavailable("The observation value is missing or invalid.");
  }
  if ((required.unit === "boolean") !== (typeof value === "boolean")) return unavailable("The value type does not match its unit.");
  return {
    state: "available",
    observation: {
      ...required,
      value,
      source: candidate.source,
      coverage: 1,
      basis: "host",
    },
  };
}
