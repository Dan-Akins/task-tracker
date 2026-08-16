import TaskSection from "@/app/components/tasks/TaskSection";
import { PRIORITY_META, STATUS_ORDER } from "@/lib/taskMeta";
import type { TaskStatus } from "@/app/generated/prisma/enums";
import type { Task } from "@/types/task";

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

  const byPriority = (a: Task, b: Task) => PRIORITY_META[a.priority].order - PRIORITY_META[b.priority].order;

  const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
  for (const taskItem of tasks) grouped[taskItem.status].push(taskItem);
  for (const status of STATUS_ORDER) grouped[status].sort(byPriority);

  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => (
        <TaskSection key={status} status={status} tasks={grouped[status]} />
      ))}
    </div>
  );
}
