import { PRIORITY_META, STATUS_META } from "@/lib/taskMeta";

// Illustrative mockup, not a real screenshot — built from the app's own
// status/priority tokens (lib/taskMeta.ts) so it stays visually in sync
// with the real dashboard without maintaining a separate image asset.
const PREVIEW_TASKS = [
  { title: "Design landing page", status: "in_progress", priority: "high" },
  { title: "Write launch copy", status: "todo", priority: "medium" },
  { title: "Fix billing webhook", status: "done", priority: "high" },
  { title: "Update docs", status: "todo", priority: "low" },
] as const;

export default function AppPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-1.5 border-b border-gray-200 px-3 py-2.5 dark:border-gray-700">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-green-400" />
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-900 dark:text-gray-50">Task Tracker</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{PREVIEW_TASKS.length} tasks</span>
        </div>
        {PREVIEW_TASKS.map((task) => {
          const statusMeta = STATUS_META[task.status];
          const priorityMeta = PRIORITY_META[task.priority];
          return (
            <div
              key={task.title}
              className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-2 dark:border-gray-700"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className={`size-2 shrink-0 rounded-full ${statusMeta.dot}`} />
                <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-300">
                  {task.title}
                </span>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold ${priorityMeta.className}`}>
                {priorityMeta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
