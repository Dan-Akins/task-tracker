"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/app/generated/prisma/enums";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createTask(formData: FormData) {
  const userId = await getUserId();
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;

  if (!title) return;

  await prisma.task.create({
    data: { title, description, userId },
  });

  revalidatePath("/");
}

const statusCycle: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

export async function deleteTask(id: number) {
  const userId = await getUserId();

  await prisma.task.delete({
    where: { id, userId },
  });

  revalidatePath("/");
}

export async function cycleStatus(id: number, current: TaskStatus) {
  const userId = await getUserId();

  await prisma.task.update({
    where: { id, userId },
    data: { status: statusCycle[current] },
  });

  revalidatePath("/");
}
