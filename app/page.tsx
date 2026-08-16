import { Suspense } from "react";
import Link from "next/link";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import NewTaskForm from "@/app/components/tasks/NewTaskForm";
import TaskList from "@/app/components/tasks/TaskList";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import StatusFilter from "@/app/components/tasks/StatusFilter";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireSession();
  const userId = session.user.id;
  const { status: statusFilter } = await searchParams;

  const allTasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const tasks = statusFilter
    ? allTasks.filter((t) => t.status === statusFilter)
    : allTasks;

  const hasAnyTasks = allTasks.length > 0;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">

        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">Task Tracker</h1>
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
              {allTasks.length} task{allTasks.length !== 1 ? "s" : ""}
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

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          >
            Dashboard
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
          >
            Account
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </Link>
        </div>

        <NewTaskForm />

        <Suspense>
          <StatusFilter />
        </Suspense>

        <TaskList tasks={tasks} hasAnyTasks={hasAnyTasks} />
      </div>
    </div>
  );
}
