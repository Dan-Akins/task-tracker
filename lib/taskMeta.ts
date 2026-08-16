import { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";

export const STATUS_META: Record<
  TaskStatus,
  { label: string; dot: string; badge: string; accent: string }
> = {
  todo: {
    label: "To Do",
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400",
    accent: "bg-gray-400",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-600 dark:bg-blue-400",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    accent: "bg-blue-600",
  },
  done: {
    label: "Done",
    dot: "bg-green-600 dark:bg-green-400",
    badge: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    accent: "bg-green-600",
  },
};

export const STATUS_ORDER: TaskStatus[] = ["in_progress", "todo", "done"];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; className: string; dot: string; order: number }
> = {
  high: {
    label: "High",
    className: "text-red-600 dark:text-red-400",
    dot: "bg-red-600 dark:bg-red-400",
    order: 0,
  },
  medium: {
    label: "Medium",
    className: "text-amber-500 dark:text-amber-400",
    dot: "bg-amber-500 dark:bg-amber-400",
    order: 1,
  },
  low: {
    label: "Low",
    className: "text-gray-400 dark:text-gray-500",
    dot: "bg-gray-400 dark:bg-gray-500",
    order: 2,
  },
};
