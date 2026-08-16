import { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  category: string | null;
  createdAt: Date;
};
