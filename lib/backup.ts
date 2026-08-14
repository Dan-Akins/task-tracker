import { prisma } from "@/lib/prisma";

export type DatabaseBackup = {
  exportedAt: string;
  counts: { users: number; tasks: number; sessions: number };
  users: Awaited<ReturnType<typeof prisma.user.findMany>>;
  tasks: Awaited<ReturnType<typeof prisma.task.findMany>>;
  sessions: Awaited<ReturnType<typeof prisma.session.findMany>>;
};

/**
 * Exports every row of every table, including password hashes, so a
 * restore doesn't force every user to reset their password. Treat the
 * output as credential material: store and transmit it accordingly.
 */
export async function exportDatabase(): Promise<DatabaseBackup> {
  const [users, tasks, sessions] = await Promise.all([
    prisma.user.findMany(),
    prisma.task.findMany(),
    prisma.session.findMany(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    counts: { users: users.length, tasks: tasks.length, sessions: sessions.length },
    users,
    tasks,
    sessions,
  };
}
