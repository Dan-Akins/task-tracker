"use client";

import { useTransition } from "react";
import { cycleStatus } from "@/app/actions";
import { TaskStatus } from "@/app/generated/prisma/enums";

const statusConfig: Record<
  TaskStatus,
  { label: string; badge: string; accent: string; dot: string }
> = {
  todo: {
    label: "To Do",
    badge: "bg-slate-100 text-slate-600",
    accent: "bg-slate-400",
    dot: "bg-slate-400",
  },
  in_progress: {
    label: "In Progress",
    badge: "bg-amber-50 text-amber-700",
    accent: "bg-amber-400",
    dot: "bg-amber-400",
  },
  done: {
    label: "Done",
    badge: "bg-emerald-50 text-emerald-700",
    accent: "bg-emerald-500",
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
    style: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
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
    <li className="flex overflow-hidden rounded-2xl border border-zinc-100 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <span className={`w-1.5 shrink-0 ${cfg.accent}`} />
      <div className="flex flex-col gap-3 flex-1 min-w-0 bg-white px-6 py-5">
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

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-zinc-400">{date}</span>
          <button
            onClick={handleCycle}
            disabled={pending}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${action.style}`}
          >
            {pending ? "…" : action.label}
          </button>
        </div>
      </div>
    </li>
  );
}
