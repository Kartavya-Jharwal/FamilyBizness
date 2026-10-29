import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConstitutionPage from "./constitution-page";
import { workspaceKey } from "./workspace";
import { ipsKey } from "./ips";
vi.mock("@/features/profiles/session", () => ({ selectedProfileId: () => "policy-test", profileScope: () => "policy-test-session" }));
beforeEach(() => { localStorage.removeItem(ipsKey("policy-test")); localStorage.removeItem(workspaceKey("policy-test")); vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Network is forbidden"); })); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); localStorage.removeItem(ipsKey("policy-test")); localStorage.removeItem(workspaceKey("policy-test")); });
const open = () => render(<MemoryRouter><ConstitutionPage /></MemoryRouter>);
describe("constitution UI", () => {
  it("activates only after saving and explicitly reviewing the IPS revision", () => {
    open();
    const activate = screen.getByRole("button", { name: "Activate saved revision as IPS" }) as HTMLButtonElement;
    expect(activate.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Constitution Markdown"), { target: { value: "# IPS\nEquities shall not exceed 55% of investable assets." } });
    fireEvent.click(screen.getByRole("button", { name: "Save locally" }));
    expect(activate.disabled).toBe(true);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(activate);
    expect(screen.getByText(/Active IPS revision 1/)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(ipsKey("policy-test"))!).revision).toBe(1);
  });
  it("previews a draft without activating it, then saves and reloads locally", () => {
    open();
    fireEvent.change(screen.getByLabelText("Constitution Markdown"), { target: { value: "# Draft\nEquities shall not exceed 45% of investable assets." } });
    expect(screen.getByText(/Draft preview: Limit exceeded/)).toBeTruthy();
    expect(localStorage.getItem(ipsKey("policy-test"))).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save locally" }));
    expect(screen.getByRole("status").textContent).toContain("Saved in this browser");
    cleanup(); open();
    expect((screen.getByLabelText("Constitution Markdown") as HTMLTextAreaElement).value).toContain("45%");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("loads four working sample checks without saving or replacing an active revision", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: "Load working example" }));
    expect(screen.getAllByText("Draft preview: Pass")).toHaveLength(4);
    expect(screen.queryByText("Draft preview: Needs review")).toBeNull();
    expect(localStorage.getItem(ipsKey("policy-test"))).toBeNull();
    expect(localStorage.getItem(workspaceKey("policy-test"))).toBeNull();
    expect((screen.getByRole("button", { name: "Activate saved revision as IPS" }) as HTMLButtonElement).disabled).toBe(true);
  });
  it("keeps a failed save draft visible and reports the failure", () => {
    open(); vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    fireEvent.change(screen.getByLabelText("Constitution Markdown"), { target: { value: "# Unsaved draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Save locally" }));
    expect(screen.getByRole("alert").textContent).toContain("Storage unavailable");
    expect((screen.getByLabelText("Constitution Markdown") as HTMLTextAreaElement).value).toBe("# Unsaved draft");
  });
  it("previews hostile markup as text without creating remote images", () => {
    const { container } = open();
    fireEvent.change(screen.getByLabelText("Constitution Markdown"), { target: { value: '<img src="https://example.invalid/private" onerror="alert(1)">' } });
    fireEvent.click(screen.getByRole("button", { name: "Text preview" }));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("pre")?.textContent).toContain("<img");
  });
});
