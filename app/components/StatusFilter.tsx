"use client";

import { useRouter, useSearchParams } from "next/navigation";

const filters = [
  { label: "All", value: "" },
  { label: "To Do", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
] as const;

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map(({ label, value }) => (
        <button
          key={value || "all"}
          onClick={() => setFilter(value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            current === value
              ? "bg-gray-900 text-white dark:bg-gray-50 dark:text-gray-900"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
