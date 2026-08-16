"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/actions";
import {
  TASK_CATEGORY_MAX_LENGTH,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/validation";

export default function NewTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTask(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError("");
      formRef.current?.reset();
    });
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4 w-full max-w-[600px] mx-auto dark:bg-gray-800 dark:border-gray-700"
    >
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">New Task</h2>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-400">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={TASK_TITLE_MAX_LENGTH}
          placeholder="What needs to be done?"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50 dark:placeholder:text-gray-400"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-400">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={TASK_DESCRIPTION_MAX_LENGTH}
          placeholder="Optional details…"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50 dark:placeholder:text-gray-400"
        />
      </div>

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
            defaultValue="medium"
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
    </form>
  );
}
