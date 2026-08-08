import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import NewTaskForm from "@/app/components/NewTaskForm";
import TaskCard from "@/app/components/TaskCard";

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

  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

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
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="size-12 rounded-full bg-zinc-100 flex items-center justify-center text-2xl">
              ✓
            </div>
            <p className="text-sm text-zinc-400">No tasks yet — add one above.</p>
          </div>
        ) : (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-500 tracking-normal">
                Tasks
              </h2>
              <div className="flex items-center gap-2">
                {counts.todo > 0 && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {counts.todo} to do
                  </span>
                )}
                {counts.in_progress > 0 && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    {counts.in_progress} in progress
                  </span>
                )}
                {counts.done > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {counts.done} done
                  </span>
                )}
              </div>
            </div>

            <ul className="flex flex-col gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  description={task.description}
                  status={task.status}
                  createdAt={task.createdAt}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
