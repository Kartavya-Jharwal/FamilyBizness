import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getDemoStore, resetDemoStore } from "../static-store";
import { invoke } from "./core";

beforeEach(() => {
  localStorage.clear();
  resetDemoStore();
  vi.stubGlobal("fetch", vi.fn(() => {
    throw new Error("The static host must not contact a market-data provider");
  }));
});

afterEach(() => vi.unstubAllGlobals());

it.each([
  ["reset_provider_history", { assetId: "FX:USD/EUR" }],
  ["reset_all_provider_history", {}],
] as const)("rejects unavailable %s instead of reporting a fictitious commit", async (command, args) => {
  const before = JSON.stringify(getDemoStore());
  await expect(invoke(command, args)).rejects.toBeInstanceOf(Error);
  expect(fetch).not.toHaveBeenCalled();
  expect(JSON.stringify(getDemoStore())).toBe(before);
});
