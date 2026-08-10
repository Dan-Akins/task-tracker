import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import ThemeToggle from "@/app/components/ThemeToggle";
import { TaskStatus } from "@/app/generated/prisma/enums";

export const dynamic = "force-dynamic";

const statusMeta: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  todo: { label: "To Do", dot: "bg-gray-400", text: "text-gray-900 dark:text-gray-50" },
  in_progress: { label: "In Progress", dot: "bg-blue-600 dark:bg-blue-400", text: "text-gray-900 dark:text-gray-50" },
  done: { label: "Done", dot: "bg-green-600 dark:bg-green-400", text: "text-gray-900 dark:text-gray-50" },
};

const statusOrder: TaskStatus[] = ["in_progress", "todo", "done"];

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const counts = await prisma.task.groupBy({
    by: ["status"],
    where: { userId },
    _count: { _all: true },
  });

  const countByStatus: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 };
  for (const row of counts) {
    countByStatus[row.status] = row._count._all;
  }
  const total = countByStatus.todo + countByStatus.in_progress + countByStatus.done;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">

        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">Dashboard</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {total} task{total !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-sm text-gray-500 hidden sm:block dark:text-gray-400">{session.user.email}</p>
            <ThemeToggle />
            <form action={handleSignOut}>
              <button
                type="submit"
                className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-md text-xs sm:text-sm sm:px-4 hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
          Back to tasks
        </Link>

        <section className="grid grid-cols-3 gap-3">
          {statusOrder.map((status) => {
            const meta = statusMeta[status];
            return (
              <div
                key={status}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${meta.dot}`} />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{meta.label}</span>
                </div>
                <p className={`mt-2 text-3xl font-semibold ${meta.text}`}>{countByStatus[status]}</p>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
