import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import NewTaskForm from "@/app/components/NewTaskForm";
import TaskRow from "@/app/components/TaskRow";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = Number(session.user.id);

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-2xl flex flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Task Tracker</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1 shrink-0">
            <p className="text-sm text-zinc-500 hidden sm:block">{session.user.email}</p>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <NewTaskForm />

        {tasks.length === 0 ? (
          <p className="text-center text-sm text-zinc-400 py-12">
            No tasks yet — add one above.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                id={task.id}
                title={task.title}
                description={task.description}
                status={task.status}
                createdAt={task.createdAt}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
