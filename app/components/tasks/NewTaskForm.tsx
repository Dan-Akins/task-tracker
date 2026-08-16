"use client";

import { useRef, useState, useTransition } from "react";
import { createTask } from "@/app/actions";
import NewTaskDetailsFields from "@/app/components/tasks/NewTaskDetailsFields";
import NewTaskMetaFields from "@/app/components/tasks/NewTaskMetaFields";

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

      <NewTaskDetailsFields />
      <NewTaskMetaFields pending={pending} />
    </form>
  );
}
