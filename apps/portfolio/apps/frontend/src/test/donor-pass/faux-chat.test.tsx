import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { FauxChat } from "@/features/ai-assistant/components/faux-chat";
import { FAUX_AI_ERROR } from "@/adapters/web/ai-streaming";
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error("Network forbidden");
    }),
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("shows a labelled preview, timed progress and the fixed ending in the actual chat", async () => {
  render(<FauxChat />);
  expect(screen.getByText("Scripted preview")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Summarise net worth" }));
  expect(screen.getByRole("button", { name: "Review cash" })).toBeDisabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await act(() => vi.advanceTimersByTimeAsync(450));
  expect(screen.getByRole("log")).toHaveTextContent(
    "Opening the imaginary ledger.",
  );
  await act(() => vi.runAllTimersAsync());
  expect(screen.getByRole("alert")).toHaveTextContent(FAUX_AI_ERROR);
  expect(screen.getByRole("button", { name: "Review cash" })).toBeEnabled();
  expect(fetch).not.toHaveBeenCalled();
});
it("cancels and restarts without a late result from the cancelled run", async () => {
  render(<FauxChat />);
  fireEvent.click(screen.getByRole("button", { name: "Review cash" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel preview" }));
  await act(() => vi.runAllTimersAsync());
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Preview cancelled");
  fireEvent.click(
    screen.getByRole("button", { name: "Explain portfolio risk" }),
  );
  await act(() => vi.runAllTimersAsync());
  expect(screen.getByRole("alert")).toHaveTextContent(FAUX_AI_ERROR);
});
it("does not persist custom prompts or leave work running after navigation", async () => {
  const before = { ...localStorage };
  const view = render(<FauxChat />);
  fireEvent.change(screen.getByLabelText("Try a custom sample prompt"), {
    target: { value: "Local-only sample" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Play preview" }));
  view.unmount();
  await act(() => vi.runAllTimersAsync());
  expect(vi.getTimerCount()).toBe(0);
  expect({ ...localStorage }).toEqual(before);
  expect(fetch).not.toHaveBeenCalled();
});
