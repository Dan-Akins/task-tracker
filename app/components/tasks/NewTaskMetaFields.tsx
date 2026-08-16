import { TASK_CATEGORY_MAX_LENGTH } from "@/lib/validation";
import { DEFAULT_TASK_PRIORITY } from "@/lib/taskMeta";

type Props = {
  pending: boolean;
};

export default function NewTaskMetaFields({ pending }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Due Date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50 dark:[color-scheme:dark]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Category
          </label>
          <input
            id="category"
            name="category"
            type="text"
            maxLength={TASK_CATEGORY_MAX_LENGTH}
            placeholder="e.g. Work, Personal…"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50 dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-400">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={DEFAULT_TASK_PRIORITY}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="self-end bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Adding…" : "Add Task"}
        </button>
      </div>
    </>
  );
}
