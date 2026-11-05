import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ErpTaskFields, ErpTaskList } from "./erpnext-task-workspace";
import { CalWeekAgenda, meetingConflictIds } from "./cal-calendar-frontend";
import { decodeOperations, initialOperations, sampleFamilyMeetings, scheduleOccurrences } from "./operations-model";

afterEach(() => { cleanup(); localStorage.removeItem("familybizness:erp-view"); });
it("retains ERPNext task field metadata and validates it within the existing operations pack", () => {
  const row = { ...initialOperations("2026-11-03").obligations[0], task: { project: "Annual stewardship", priority: "High" as const, progress: 40, startDate: "2026-11-03" } };
  expect(decodeOperations(JSON.stringify({ version: 1, obligations: [row] })).obligations[0].task).toEqual(row.task);
  expect(() => decodeOperations(JSON.stringify({ version: 1, obligations: [{ ...row, task: { ...row.task, progress: 101 } }] }))).toThrow();
  const change = vi.fn(); render(<ErpTaskFields draft={row} onChange={change}/>);
  fireEvent.change(screen.getByLabelText("Project"), { target: { value: "Board year" } });
  expect(change.mock.calls[0][0].task.project).toBe("Board year");
  expect(screen.getByLabelText("Priority")).toHaveValue("High");
});
it("ports donor selected-item actions while requiring completion evidence", () => {
  const row = initialOperations("2026-11-03").obligations[0]; const bulk = vi.fn(() => true);
  render(<ErpTaskList rows={[row]} today="2026-11-03" onEdit={vi.fn()} onBulkStatus={bulk}/>);
  fireEvent.click(screen.getByLabelText(`Select ${row.title}`));
  expect(screen.getByRole("button", { name: "Set as Completed" })).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Completion evidence"), { target: { value: "Minutes filed" } });
  fireEvent.click(screen.getByRole("button", { name: "Set as Completed" }));
  expect(bulk).toHaveBeenCalledWith([row.id], "Complete", "Minutes filed");
});
it("uses the donor overlap sweep without treating touching or different-zone meetings as collisions", () => {
  const meeting = sampleFamilyMeetings("2026-11-03")[0];
  const overlap = { ...meeting, id: "overlap", meeting: { ...meeting.meeting!, start: "11:00", end: "12:00" } };
  const touching = { ...meeting, id: "touching", meeting: { ...meeting.meeting!, start: "12:00", end: "13:00" } };
  const otherZone = { ...meeting, id: "other-zone", meeting: { ...meeting.meeting!, timeZone: "America/New_York" } };
  expect([...meetingConflictIds([meeting, overlap, touching, otherZone])].sort()).toEqual(["family-council-meeting", "overlap"]);
  render(<CalWeekAgenda rows={[meeting, overlap]} week="2026-11-02" view="Week" renderEvent={row => <span>{row.title}</span>}/>);
  expect(screen.getAllByText(/Overlapping meeting/)).toHaveLength(2);
});

it("moves recurring task start dates with their occurrence and resets progress", () => {
  const row = { ...initialOperations("2026-11-03").obligations[0], task: { project: "Review", priority: "Medium" as const, progress: 70, startDate: "2026-11-03" }, schedule: { frequency: "Monthly" as const, until: "2026-12-05" } };
  const next = scheduleOccurrences({ version: 1, obligations: [row] }, "2026-12-05").obligations[1];
  expect(next.due).toBe("2026-12-05"); expect(next.task?.startDate).toBe("2026-12-03"); expect(next.task?.progress).toBe(0);
});

it("opens the existing scheduler editor with the selected half-hour cell", () => {
  const select = vi.fn();
  render(<CalWeekAgenda rows={[]} week="2026-11-02" view="Week" renderEvent={row => <span>{row.title}</span>} onSelectSlot={select}/>);
  fireEvent.click(screen.getByRole("button", { name: "Schedule meeting 2026-11-05 10:30" }));
  expect(select).toHaveBeenCalledWith("2026-11-05", "10:30");
});

it("projects the same Task records into the donor project summary and drilldown", () => {
  const row = { ...initialOperations("2026-11-03").obligations[0], task: { project: "Succession readiness", priority: "High" as const, progress: 40, startDate: "2026-11-03" } };
  render(<ErpTaskList rows={[row]} today="2026-11-03" onEdit={vi.fn()} onBulkStatus={vi.fn(() => true)}/>);
  expect(screen.getByText("Open Projects")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Project summary" }));
  expect(screen.getByRole("table", { name: "Project Summary" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Succession readiness" }));
  expect(screen.getByLabelText("Project")).toHaveValue("Succession readiness");
  expect(screen.getByRole("button", { name: row.title })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Task board" }));
  expect(screen.getByLabelText("Task board")).toBeInTheDocument();
});
