"use client";

import { useTransition } from "react";
import { cycleStatus, deleteTask } from "@/app/actions";
import { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";

const statusConfig: Record<
  TaskStatus,
  { label: string; badge: string; accent: string; dot: string }
> = {
  todo: {
    label: "To Do",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400",
    accent: "bg-gray-400",
    dot: "bg-gray-400",
  },
  in_progress: {
    label: "In Progress",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    accent: "bg-blue-600",
    dot: "bg-blue-600 dark:bg-blue-400",
  },
  done: {
    label: "Done",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    accent: "bg-green-600",
    dot: "bg-green-600 dark:bg-green-400",
  },
};

const nextAction: Record<TaskStatus, { label: string; style: string }> = {
  todo: {
    label: "Start",
    style: "bg-blue-600 text-white hover:bg-blue-700",
  },
  in_progress: {
    label: "Complete",
    style: "bg-green-600 text-white hover:bg-green-700",
  },
  done: {
    label: "Reset",
    style: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-600",
  },
};

const priorityConfig: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  high: { label: "High", className: "text-red-600 dark:text-red-400", dot: "bg-red-600 dark:bg-red-400" },
  medium: { label: "Medium", className: "text-amber-500 dark:text-amber-400", dot: "bg-amber-500 dark:bg-amber-400" },
  low: { label: "Low", className: "text-gray-400 dark:text-gray-500", dot: "bg-gray-400 dark:bg-gray-500" },
};

interface Props {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  category: string | null;
  createdAt: Date;
}

export default function TaskCard({ id, title, description, status, priority, dueDate, category, createdAt }: Props) {
  const [pending, startTransition] = useTransition();

  function handleCycle() {
    startTransition(() => cycleStatus(id, status));
  }

  const date = createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const isOverdue = dueDate && status !== "done" && new Date() > dueDate;
  const dueDateStr = dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const cfg = statusConfig[status];
  const action = nextAction[status];
  const pri = priorityConfig[priority];

  return (
    <li className={`flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-800 dark:border-gray-700${status === "done" ? " opacity-60" : ""}`}>
      <span className={`w-1.5 shrink-0 ${cfg.accent}`} />
      <div className="flex flex-col gap-2 flex-1 min-w-0 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug min-w-0 truncate sm:text-base dark:text-gray-50">{title}</p>
            {category && (
              <span className="shrink-0 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                {category}
              </span>
            )}
          </div>
          <span
            className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium shrink-0 ${cfg.badge}`}
          >
            <span className={`size-1 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed dark:text-gray-400">{description}</p>
        )}

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{date}</span>
            {dueDate && (
              <>
                <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Due {dueDateStr}
                </span>
              </>
            )}
            <span className="text-gray-300 dark:text-gray-600" aria-hidden="true">·</span>
            <span className={`flex items-center gap-1 text-xs font-medium ${pri.className}`}>
              <span className={`size-1.5 rounded-full shrink-0 ${pri.dot}`} />
              {pri.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCycle}
              disabled={pending}
              className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${action.style}`}
            >
              {pending ? "…" : action.label}
            </button>
            <form action={deleteTask.bind(null, id)}>
              <button
                type="submit"
                aria-label="Delete task"
                onClick={(e) => { if (!window.confirm("Delete this task?")) e.preventDefault(); }}
                className="text-gray-400 hover:text-red-500 transition-colors dark:text-gray-500 dark:hover:text-red-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/>
                  <path d="M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </li>
  );
}
