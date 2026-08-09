"use client";

import { useTransition } from "react";
import { cycleStatus, deleteTask } from "@/app/actions";
import { TaskStatus } from "@/app/generated/prisma/enums";

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

interface Props {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
}

export default function TaskCard({ id, title, description, status, createdAt }: Props) {
  const [pending, startTransition] = useTransition();

  function handleCycle() {
    startTransition(() => cycleStatus(id, status));
  }

  const date = createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const cfg = statusConfig[status];
  const action = nextAction[status];

  return (
    <li className={`flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-800 dark:border-gray-700${status === "done" ? " opacity-60" : ""}`}>
      <span className={`w-1.5 shrink-0 ${cfg.accent}`} />
      <div className="flex flex-col gap-2 flex-1 min-w-0 px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 leading-snug min-w-0 truncate sm:text-base dark:text-gray-50">{title}</p>
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
          <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
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
