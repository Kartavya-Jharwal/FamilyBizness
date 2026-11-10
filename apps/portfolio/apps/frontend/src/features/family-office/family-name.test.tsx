import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FamilyNameField, setFamilyName } from "./family-name";

const key = "familybizness:family-name";
beforeEach(() => { localStorage.clear(); setFamilyName("Smith"); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); });

it("preserves spaces while typing a multiword surname and persists the complete name", async () => {
  const user = userEvent.setup();
  render(<FamilyNameField />);
  const field = screen.getByLabelText("Family surname");
  await user.clear(field);
  await user.type(field, "Van der Meer");
  expect(field).toHaveValue("Van der Meer");
  await user.tab();
  expect(localStorage.getItem(key)).toBe("Van der Meer");
  expect(document.title).toBe("Van der Meer Family Office");
});

it("keeps editing usable and reports session-only state when storage rejects writes", async () => {
  const user = userEvent.setup();
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Storage denied", "SecurityError"); });
  render(<FamilyNameField />);
  const field = screen.getByLabelText("Family surname");
  await user.clear(field);
  await user.type(field, "Private Family");
  expect(field).toHaveValue("Private Family");
  expect(document.title).toBe("Private Family Family Office");
  expect(screen.getByRole("status")).toHaveTextContent("Used for this visit only");
  expect(screen.getByRole("status")).not.toHaveTextContent("Saved automatically");
});

it("synchronizes the field and document title on cross-tab changes and storage clearing", () => {
  render(<FamilyNameField />);
  act(() => window.dispatchEvent(new StorageEvent("storage", { key, newValue: "Cross Tab" })));
  expect(screen.getByLabelText("Family surname")).toHaveValue("Cross Tab");
  expect(document.title).toBe("Cross Tab Family Office");
  act(() => window.dispatchEvent(new StorageEvent("storage", { key: null, newValue: null })));
  expect(screen.getByLabelText("Family surname")).toHaveValue("Smith");
  expect(document.title).toBe("Smith Family Office");
});
