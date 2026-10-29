import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@/adapters/web/core";
import { demoIpsFacts, getDemoStore, resetDemoStore } from "@/adapters/static-store";
import { selectedProfileId } from "@/features/profiles/session";
import { activateIps, assessIps, ipsKey, previewPolicy, readActiveIps } from "./ips";
import { REVIEW_EXAMPLES, WORKING_POLICY_EXAMPLE } from "./examples";
import { parseConstitution } from "./policy";
import { freshRecord, loadWorkspace, saveWorkspace, workspaceKey } from "./workspace";

const profile = () => selectedProfileId() ?? "static-demo";
const text = "# IPS\nEquities shall not exceed 55% of investable assets.";
function clear() { localStorage.removeItem(ipsKey(profile())); localStorage.removeItem(workspaceKey(profile())); resetDemoStore(); }
beforeEach(clear); afterEach(clear);
function activate(content = text) {
  const saved = saveWorkspace(localStorage, workspaceKey(profile()), { ...freshRecord(), content });
  return activateIps(localStorage, profile(), saved, "USD", true);
}
describe("IPS financial mutation enforcement", () => {
  it("evaluates all four working examples and enforces their saved revision", async () => {
    const before = JSON.stringify(getDemoStore());
    expect(previewPolicy(WORKING_POLICY_EXAMPLE, demoIpsFacts()).map((finding) => finding.status)).toEqual(["pass", "pass", "pass", "pass"]);
    expect(JSON.stringify(getDemoStore())).toBe(before);
    expect(readActiveIps(localStorage, profile())).toBeNull();
    const active = activate(WORKING_POLICY_EXAMPLE);
    expect(assessIps(active, demoIpsFacts()).every((finding) => finding.status === "pass")).toBe(true);
    await expect(invoke("delete_account", { accountId: "acc-cash" })).rejects.toThrow("IPS revision 1");
    await expect(invoke("delete_account", { accountId: "acc-education" })).resolves.toBeUndefined();
    expect(assessIps(active, demoIpsFacts()).every((finding) => finding.status === "pass")).toBe(true);
  });
  it("keeps the two conditional examples for review without inventing an event or approval", () => {
    const content = `${WORKING_POLICY_EXAMPLE}\n## Review conditions\n${REVIEW_EXAMPLES.join("\n")}`;
    expect(previewPolicy(content, demoIpsFacts()).map((finding) => finding.status)).toEqual(["pass", "pass", "pass", "pass", "not_configured", "not_configured"]);
    expect(parseConstitution(content).gates.slice(-2).every((gate) => gate.recognitionStatus === "pending")).toBe(true);
  });
  it("preserves minimum and maximum direction for common private-market wording", () => {
    expect(previewPolicy("# IPS\nPrivate markets must be at least 30% of investable assets.", demoIpsFacts())[0].status).toBe("breach");
    expect(previewPolicy("# IPS\nPrivate markets shall not exceed 30% of investable assets.", demoIpsFacts())[0].status).toBe("pass");
  });
  it("blocks violating account deletion at the adapter and leaves memory and persisted data unchanged", async () => {
    activate(); const before = JSON.stringify(getDemoStore()); const disk = localStorage.getItem("fb-demo-store-v2");
    await expect(invoke("delete_account", { accountId: "acc-cash" })).rejects.toThrow(/IPS revision 1.*Line 2/);
    expect(JSON.stringify(getDemoStore())).toBe(before); expect(localStorage.getItem("fb-demo-store-v2")).toBe(disk);
  });
  it("allows a supported compliant account change", async () => {
    activate(); await invoke("delete_account", { accountId: "acc-education" });
    expect(getDemoStore().accounts.some((account) => account.id === "acc-education")).toBe(false);
    expect(assessIps(readActiveIps(localStorage, profile())!, demoIpsFacts())[0].status).toBe("pass");
  });
  it("does not silently enforce an unactivated draft", async () => {
    saveWorkspace(localStorage, workspaceKey(profile()), { ...freshRecord(), content: text });
    await expect(invoke("delete_account", { accountId: "acc-cash" })).resolves.toBeUndefined();
  });
  it("requires review of an exact saved revision and retains active revision across draft edits", () => {
    const saved = saveWorkspace(localStorage, workspaceKey(profile()), { ...freshRecord(), content: text });
    expect(() => activateIps(localStorage, profile(), saved, "USD", false)).toThrow("review");
    expect(() => activateIps(localStorage, profile(), { ...saved, content: "# Different" }, "USD", true)).toThrow("exact revision");
    activateIps(localStorage, profile(), saved, "USD", true);
    saveWorkspace(localStorage, workspaceKey(profile()), { ...saved, content: text.replace("55%", "90%") });
    expect(readActiveIps(localStorage, profile())?.revision).toBe(1);
    expect(readActiveIps(localStorage, "another-profile")).toBeNull();
  });
  it("blocks unsupported facts as needs-review rather than a pass", async () => {
    activate("# IPS\nMaintain at least 18 months of family spending in cash.");
    const before = JSON.stringify(getDemoStore());
    await expect(invoke("delete_account", { accountId: "acc-education" })).rejects.toThrow("needs review");
    expect(JSON.stringify(getDemoStore())).toBe(before);
  });
  it("blocks financial metadata changes without post-change valuation but permits a rename", async () => {
    activate();
    await expect(invoke("update_settings", { settingsUpdate: { baseCurrency: "GBP" } })).rejects.toThrow("needs review");
    expect(getDemoStore().settings.baseCurrency).toBe("USD");
    await expect(invoke("update_account", { accountUpdate: { id: "acc-cash", name: "Local name" } })).resolves.toBeTruthy();
  });
  it("fails closed for currency/scope corruption and empty coverage", async () => {
    const active = activate();
    expect(assessIps(active, { ...demoIpsFacts(), currency: "GBP" })[0].status).toBe("not_configured");
    expect(assessIps(active, { ...demoIpsFacts(), accounts: [] })[0].status).toBe("not_configured");
    localStorage.setItem(ipsKey(profile()), JSON.stringify({ ...active, profileId: "wrong" }));
    await expect(invoke("delete_account", { accountId: "acc-education" })).rejects.toThrow("profile scope");
    expect(getDemoStore().accounts).toHaveLength(5);
  });
  it("blocks unsupported archival and trade commands instead of reporting success", async () => {
    activate();
    await expect(invoke("update_account", { accountUpdate: { id: "acc-cash", isArchived: true } })).rejects.toThrow("needs review");
    await expect(invoke("create_activity", { activity: {} })).rejects.toThrow("No trade");
    expect(getDemoStore().accounts.find((account) => account.id === "acc-cash")?.isArchived).toBe(false);
  });
  it("does not commit an in-memory change when storage rejects persistence", async () => {
    activate(); const before = JSON.stringify(getDemoStore());
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    try { await expect(invoke("delete_account", { accountId: "acc-education" })).rejects.toThrow("quota"); expect(JSON.stringify(getDemoStore())).toBe(before); }
    finally { spy.mockRestore(); }
  });
  it("does not let resetting fixtures bypass an active IPS", async () => {
    activate(); await invoke("delete_account", { accountId: "acc-education" });
    const current = loadWorkspace(localStorage, workspaceKey(profile()));
    const next = saveWorkspace(localStorage, workspaceKey(profile()), { ...current, content: text.replace("55%", "51%") });
    activateIps(localStorage, profile(), next, "USD", true);
    expect(() => resetDemoStore()).toThrow("IPS revision 2");
    expect(getDemoStore().accounts.some((account) => account.id === "acc-education")).toBe(false);
  });
});
