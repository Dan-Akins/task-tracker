"use client";

import { useTransition } from "react";
import { cycleStatus } from "@/app/actions";
import { TaskStatus } from "@/app/generated/prisma/enums";

const statusLabel: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusStyle: Record<TaskStatus, string> = {
  todo: "bg-zinc-100 text-zinc-600",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

const nextLabel: Record<TaskStatus, string> = {
  todo: "Start",
  in_progress: "Complete",
  done: "Reset",
};

interface Props {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
}

export default function TaskRow({ id, title, description, status, createdAt }: Props) {
  const [pending, startTransition] = useTransition();

  function handleCycle() {
    startTransition(() => cycleStatus(id, status));
  }

  const date = createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate">{title}</p>
        {description && (
          <p className="text-sm text-zinc-500 line-clamp-2">{description}</p>
        )}
        <p className="text-xs text-zinc-400 mt-1">{date}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle[status]}`}>
          {statusLabel[status]}
        </span>
        <button
          onClick={handleCycle}
          disabled={pending}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "…" : nextLabel[status]}
        </button>
      </div>
    </li>
  );
}
