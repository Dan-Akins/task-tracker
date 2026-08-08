"use client";

import { useTransition } from "react";
import { cycleStatus } from "@/app/actions";
import { TaskStatus } from "@/app/generated/prisma/enums";

const statusConfig: Record<
  TaskStatus,
  { label: string; badge: string; border: string; dot: string }
> = {
  todo: {
    label: "To Do",
    badge: "bg-slate-100 text-slate-600",
    border: "border-l-slate-300",
    dot: "bg-slate-400",
  },
  in_progress: {
    label: "In Progress",
    badge: "bg-amber-50 text-amber-700",
    border: "border-l-amber-400",
    dot: "bg-amber-400",
  },
  done: {
    label: "Done",
    badge: "bg-emerald-50 text-emerald-700",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
  },
};

const nextAction: Record<TaskStatus, { label: string; style: string }> = {
  todo: {
    label: "Start",
    style: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
  },
  in_progress: {
    label: "Complete",
    style: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  },
  done: {
    label: "Reset",
    style: "border border-zinc-300 text-zinc-600 hover:bg-zinc-50",
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
    <li
      className={`flex flex-col gap-3 rounded-2xl border-l-4 bg-white px-6 py-5 shadow-sm ring-1 ring-zinc-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${cfg.border}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-base font-semibold text-zinc-900 leading-snug">{title}</p>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium shrink-0 ${cfg.badge}`}
        >
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      {description && (
        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{description}</p>
      )}

      <div className="flex items-center justify-between gap-4 pt-1 border-t border-zinc-50">
        <span className="text-xs text-zinc-400">{date}</span>
        <button
          onClick={handleCycle}
          disabled={pending}
          className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${action.style}`}
        >
          {pending ? "…" : action.label}
        </button>
      </div>
    </li>
  );
}
