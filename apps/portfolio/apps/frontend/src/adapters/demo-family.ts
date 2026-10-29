/** Illustrative family-office data used by the static donor, not real family facts. */
import type { Goal } from "@/lib/types";

export const SAMPLE_ACCOUNTS = [
  { id: "acc-public", name: "Long-term Family Capital", group: "Investments", kind: "SECURITIES", value: 4200000 },
  { id: "acc-income", name: "Income and Reserves", group: "Investments", kind: "SECURITIES", value: 1350000 },
  { id: "acc-private", name: "Private Business Investments", group: "Investments", kind: "SECURITIES", value: 2400000 },
  { id: "acc-education", name: "Next Generation Education", group: "Investments", kind: "SECURITIES", value: 750000 },
  { id: "acc-cash", name: "Family Office Operating Cash", group: "Banking", kind: "CASH", value: 450000 },
] as const;

export const SAMPLE_POSITIONS = [
  { id: "global-equity", accountId: "acc-public", symbol: "GLOBAL", name: "Global Equity Fund", kind: "equity", value: 2500000, cost: 2150000 },
  { id: "uk-equity", accountId: "acc-public", symbol: "UK-EQ", name: "UK Equity Fund", kind: "equity", value: 1700000, cost: 1500000 },
  { id: "income", accountId: "acc-income", symbol: "INCOME", name: "Diversified Income Fund", kind: "fixed", value: 1350000, cost: 1300000 },
  { id: "private", accountId: "acc-private", symbol: "PRIVATE", name: "Private Business Holdings", kind: "private", value: 2400000, cost: 2000000 },
  { id: "education", accountId: "acc-education", symbol: "EDU", name: "Education Investment Fund", kind: "equity", value: 750000, cost: 700000 },
  { id: "cash", accountId: "acc-cash", symbol: "$CASH", name: "Operating Cash", kind: "cash", value: 450000, cost: 450000 },
] as const;

const goal = (id: string, title: string, goalType: Goal["goalType"], description: string, targetAmount: number, current: number, targetDate: string): Goal => ({
  id, title, goalType, description, targetAmount, summaryTargetAmount: targetAmount,
  summaryCurrentValue: current, summaryProgress: current / targetAmount,
  currency: "USD", statusLifecycle: "active", statusHealth: "not_applicable", priority: 1,
  startDate: "2025-01-01", targetDate, createdAt: "2025-01-01T00:00:00Z", updatedAt: "2025-01-01T00:00:00Z",
});

export const SAMPLE_GOALS: Goal[] = [
  goal("goal-education", "Next generation education", "education", "Education and learning opportunities for the next generation.", 1200000, 750000, "2034-12-31"),
  goal("goal-art", "Arts and cultural patronage", "custom_save_up", "Support for artists and cultural institutions.", 500000, 180000, "2031-12-31"),
  goal("goal-values", "Family stewardship and values", "custom_save_up", "Learning and engagement around the family's shared values.", 300000, 90000, "2030-12-31"),
  goal("goal-giving", "Community giving", "custom_save_up", "A reserve for family-led community and charitable giving.", 600000, 240000, "2032-12-31"),
];

export const SAMPLE_SPENDING_CATEGORIES = [
  "Education and learning", "Arts and cultural patronage", "Family stewardship and values",
  "Community giving", "Family gatherings", "Office and professional services",
];

export const SAMPLE_MONTHLY_SPENDING = [12000, 8500, 3500, 10000, 4000, 6000];
