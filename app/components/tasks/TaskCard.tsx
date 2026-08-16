"use client";

import { useTransition } from "react";
import { cycleStatus } from "@/app/actions";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { STATUS_META, PRIORITY_META } from "@/lib/taskMeta";
import type { Task } from "@/types/task";
import TaskCardHeader from "@/app/components/tasks/TaskCardHeader";
import TaskCardMeta from "@/app/components/tasks/TaskCardMeta";
import TaskCardActions from "@/app/components/tasks/TaskCardActions";

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

type Props = Task;

export default function TaskCard({ id, title, description, status, priority, dueDate, category, createdAt }: Props) {
  const [pending, startTransition] = useTransition();

  function handleCycle() {
    startTransition(() => cycleStatus(id, status));
  }

  const date = createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const isOverdue = Boolean(dueDate && status !== "done" && new Date() > dueDate);
  const dueDateStr = dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const cfg = STATUS_META[status];
  const action = nextAction[status];
  const pri = PRIORITY_META[priority];

  return (
    <li className={`flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 dark:bg-gray-800 dark:border-gray-700${status === "done" ? " opacity-60" : ""}`}>
      <span className={`w-1.5 shrink-0 ${cfg.accent}`} />
      <div className="flex flex-col gap-2 flex-1 min-w-0 px-4 py-2.5">
        <TaskCardHeader
          title={title}
          category={category}
          statusLabel={cfg.label}
          statusBadgeClass={cfg.badge}
          statusDotClass={cfg.dot}
        />

        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed dark:text-gray-400">{description}</p>
        )}

        <div className="flex items-center justify-between gap-4">
          <TaskCardMeta
            date={date}
            dueDate={dueDate}
            dueDateStr={dueDateStr}
            isOverdue={isOverdue}
            priorityLabel={pri.label}
            priorityClassName={pri.className}
            priorityDotClass={pri.dot}
          />
          <TaskCardActions
            id={id}
            pending={pending}
            onCycle={handleCycle}
            actionLabel={action.label}
            actionStyle={action.style}
          />
        </div>
      </div>
    </li>
  );
}
