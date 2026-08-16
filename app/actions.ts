"use server";

import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUserId as getUserId } from "@/lib/session";
import { TaskStatus } from "@/app/generated/prisma/enums";
import { validateTaskInput } from "@/lib/validation";
import { consumeWriteQuota } from "@/lib/rateLimit";
import { DEFAULT_TASK_PRIORITY } from "@/lib/taskMeta";

const RATE_LIMIT_MESSAGE = "Too many requests. Please slow down and try again in a minute.";

function quotaKey(userId: string): string {
  return `user:${userId}`;
}

function checkWriteQuota(userId: string): void {
  if (!consumeWriteQuota(quotaKey(userId))) throw new Error(RATE_LIMIT_MESSAGE);
}

export async function createTask(formData: FormData): Promise<{ error: string } | undefined> {
  const userId = await getUserId();
  if (!consumeWriteQuota(quotaKey(userId))) return { error: RATE_LIMIT_MESSAGE };

  const result = validateTaskInput({
    title: (formData.get("title") as string | null) ?? "",
    description: formData.get("description") as string | null,
    priority: (formData.get("priority") as string | null) || DEFAULT_TASK_PRIORITY,
    dueDateStr: (formData.get("dueDate") as string | null)?.trim() || null,
    category: formData.get("category") as string | null,
  });

  if ("error" in result) return result;

  await prisma.task.create({
    data: { ...result.data, userId },
  });

  revalidatePath("/");
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const VALID_STATUSES = new Set<string>(Object.values(TaskStatus));

export async function deleteTask(id: number) {
  const userId = await getUserId();
  checkWriteQuota(userId);

  await prisma.task.delete({
    where: { id, userId },
  });

  revalidatePath("/");
}

export async function cycleStatus(id: number, current: TaskStatus) {
  const userId = await getUserId();
  checkWriteQuota(userId);

  if (!VALID_STATUSES.has(current)) throw new Error("Invalid status.");

  await prisma.task.update({
    where: { id, userId },
    data: { status: statusCycle[current] },
  });

  revalidatePath("/");
}

export async function deleteAccount() {
  const userId = await getUserId();
  checkWriteQuota(userId);

  // Task -> User has no onDelete: Cascade in the schema (unlike Session),
  // so tasks must be deleted before the user row or this violates the FK
  // constraint.
  await prisma.task.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  // Sessions here are JWT-based, not database-backed, so deleting the user
  // row alone doesn't invalidate an already-issued session cookie — sign
  // out explicitly or the browser is left "logged in" as a deleted user.
  await signOut({ redirectTo: "/login" });
}
