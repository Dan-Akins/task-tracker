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

  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const todo = tasks.filter((t) => t.status === "todo");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-2xl space-y-6">

        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Task Tracker</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1 shrink-0">
            <p className="text-sm text-gray-500 hidden sm:block">{session.user.email}</p>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <NewTaskForm />

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <p className="text-sm text-gray-500">No tasks yet — add one above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {inProgress.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">In Progress</h2>
                <ul className="space-y-3">
                  {inProgress.map((task) => (
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

            {todo.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">To Do</h2>
                <ul className="space-y-3">
                  {todo.map((task) => (
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

            {done.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">Done</h2>
                <ul className="space-y-3">
                  {done.map((task) => (
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
        )}
      </div>
    </div>
  );
}
