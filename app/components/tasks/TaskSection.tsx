import TaskCard from "@/app/components/tasks/TaskCard";
import { STATUS_META } from "@/lib/taskMeta";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import type { Task } from "@/types/task";

type Props = {
  status: TaskStatus;
  tasks: Task[];
};

export default function TaskSection({ status, tasks }: Props) {
  if (tasks.length === 0) return null;

  const meta = STATUS_META[status];

  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3 dark:text-gray-400">
        <span className={`size-2 rounded-full ${meta.dot}`} />
        {meta.label}
      </h2>
      <ul className="space-y-3">
        {tasks.map((taskItem) => (
          <TaskCard
            key={taskItem.id}
            id={taskItem.id}
            title={taskItem.title}
            description={taskItem.description}
            status={taskItem.status}
            priority={taskItem.priority}
            dueDate={taskItem.dueDate}
            category={taskItem.category}
            createdAt={taskItem.createdAt}
            updatedAt={taskItem.updatedAt}
          />
        ))}
      </ul>
    </section>
  );
}
