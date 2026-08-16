import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/actions", () => ({
  cycleStatus: vi.fn(),
  deleteTask: vi.fn(),
}));

import TaskCard from "./TaskCard";

const baseProps = {
  id: 1,
  title: "Write report",
  description: null,
  status: "todo" as const,
  priority: "medium" as const,
  dueDate: null,
  category: null,
  createdAt: new Date("2026-01-01"),
};

describe("TaskCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title, status label, and next action for a todo task", () => {
    render(<TaskCard {...baseProps} />);
    expect(screen.getByText("Write report")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("shows Complete as the action for an in-progress task", () => {
    render(<TaskCard {...baseProps} status="in_progress" />);
    expect(screen.getByRole("button", { name: "Complete" })).toBeInTheDocument();
  });

  it("shows Reset as the action for a done task", () => {
    render(<TaskCard {...baseProps} status="done" />);
    expect(screen.getByRole("button", { name: "Reset" })).toBeInTheDocument();
  });

  it("renders the category badge when provided", () => {
    render(<TaskCard {...baseProps} category="Work" />);
    expect(screen.getByText("Work")).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<TaskCard {...baseProps} description="Quarterly numbers" />);
    expect(screen.getByText("Quarterly numbers")).toBeInTheDocument();
  });

  it("flags an overdue task that isn't done", () => {
    render(<TaskCard {...baseProps} dueDate={new Date("2020-01-01")} />);
    expect(screen.getByText(/Due/).closest("span")).toHaveClass("text-red-500");
  });

  it("does not flag a done task as overdue even with a past due date", () => {
    render(<TaskCard {...baseProps} status="done" dueDate={new Date("2020-01-01")} />);
    expect(screen.getByText(/Due/).closest("span")).not.toHaveClass("text-red-500");
  });
});
