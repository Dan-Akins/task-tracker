import TaskCard from "@/app/components/TaskCard";
import { TaskPriority, TaskStatus } from "@/app/generated/prisma/enums";

const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

type Task = {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
};

type Props = {
  tasks: Task[];
  hasAnyTasks: boolean;
};

export default function TaskList({ tasks, hasAnyTasks }: Props) {
  if (!hasAnyTasks) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-gray-500 dark:text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="13" y2="16"/>
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium">No tasks yet.</p>
          <p className="text-sm">Add one above to get started.</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <p className="text-center text-sm text-gray-500 py-12 dark:text-gray-400">
        No tasks with this status.
      </p>
    );
  }

  const byPriority = (a: Task, b: Task) => priorityOrder[a.priority] - priorityOrder[b.priority];
  const inProgress = tasks.filter((taskItem) => taskItem.status === "in_progress").sort(byPriority);
  const todo = tasks.filter((taskItem) => taskItem.status === "todo").sort(byPriority);
  const done = tasks.filter((taskItem) => taskItem.status === "done").sort(byPriority);

  return (
    <div className="space-y-6">
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 dark:text-gray-400">In Progress</h2>
          <ul className="space-y-3">
            {inProgress.map((taskItem) => (
              <TaskCard
                key={taskItem.id}
                id={taskItem.id}
                title={taskItem.title}
                description={taskItem.description}
                status={taskItem.status}
                priority={taskItem.priority}
                createdAt={taskItem.createdAt}
              />
            ))}
          </ul>
        </section>
      )}

      {todo.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 dark:text-gray-400">To Do</h2>
          <ul className="space-y-3">
            {todo.map((taskItem) => (
              <TaskCard
                key={taskItem.id}
                id={taskItem.id}
                title={taskItem.title}
                description={taskItem.description}
                status={taskItem.status}
                priority={taskItem.priority}
                createdAt={taskItem.createdAt}
              />
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 dark:text-gray-400">Done</h2>
          <ul className="space-y-3">
            {done.map((taskItem) => (
              <TaskCard
                key={taskItem.id}
                id={taskItem.id}
                title={taskItem.title}
                description={taskItem.description}
                status={taskItem.status}
                priority={taskItem.priority}
                createdAt={taskItem.createdAt}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
