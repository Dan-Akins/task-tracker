import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/actions", () => ({
  cycleStatus: vi.fn(),
  deleteTask: vi.fn(),
}));

import { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";
import TaskList from "./TaskList";

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function makeTask(overrides: Partial<Task> & { id: number; title: string }): Task {
  return {
    description: null,
    status: "todo",
    priority: "medium",
    dueDate: null,
    category: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function titlesInOrder(): string[] {
  return screen.getAllByRole("listitem").map((li) => li.querySelector("p")!.textContent);
}

describe("TaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the no-tasks-yet empty state when the user has never created a task", () => {
    render(<TaskList tasks={[]} hasAnyTasks={false} />);
    expect(screen.getByText("No tasks yet.")).toBeInTheDocument();
  });

  it("shows the no-match empty state when tasks exist but none match the filter", () => {
    render(<TaskList tasks={[]} hasAnyTasks={true} />);
    expect(screen.getByText("No tasks with this status.")).toBeInTheDocument();
    expect(screen.queryByText("No tasks yet.")).not.toBeInTheDocument();
  });

  it("only renders section headers for statuses that have tasks", () => {
    const tasks = [makeTask({ id: 1, title: "Only todo", status: "todo" })];
    render(<TaskList tasks={tasks} hasAnyTasks={true} />);
    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "In Progress" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Done" })).not.toBeInTheDocument();
  });

  it("groups tasks under all three sections when every status is present", () => {
    const tasks = [
      makeTask({ id: 1, title: "Todo task", status: "todo" }),
      makeTask({ id: 2, title: "In progress task", status: "in_progress" }),
      makeTask({ id: 3, title: "Done task", status: "done" }),
    ];
    render(<TaskList tasks={tasks} hasAnyTasks={true} />);
    expect(screen.getByRole("heading", { name: "To Do" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In Progress" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done" })).toBeInTheDocument();
  });

  it("sorts tasks within a section by priority: high, then medium, then low", () => {
    const tasks = [
      makeTask({ id: 1, title: "Low", status: "todo", priority: "low" }),
      makeTask({ id: 2, title: "High", status: "todo", priority: "high" }),
      makeTask({ id: 3, title: "Medium", status: "todo", priority: "medium" }),
    ];
    render(<TaskList tasks={tasks} hasAnyTasks={true} />);
    expect(titlesInOrder()).toEqual(["High", "Medium", "Low"]);
  });

  it("preserves input order for tasks that share the same priority", () => {
    const tasks = [
      makeTask({ id: 1, title: "First", status: "todo", priority: "medium" }),
      makeTask({ id: 2, title: "Second", status: "todo", priority: "medium" }),
      makeTask({ id: 3, title: "Third", status: "todo", priority: "medium" }),
    ];
    render(<TaskList tasks={tasks} hasAnyTasks={true} />);
    expect(titlesInOrder()).toEqual(["First", "Second", "Third"]);
  });

  it("keeps sorting independent across sections", () => {
    const tasks = [
      makeTask({ id: 1, title: "Todo low", status: "todo", priority: "low" }),
      makeTask({ id: 2, title: "Todo high", status: "todo", priority: "high" }),
      makeTask({ id: 3, title: "Done low", status: "done", priority: "low" }),
      makeTask({ id: 4, title: "Done high", status: "done", priority: "high" }),
    ];
    render(<TaskList tasks={tasks} hasAnyTasks={true} />);
    expect(titlesInOrder()).toEqual(["Todo high", "Todo low", "Done high", "Done low"]);
  });
});
