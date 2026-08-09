"use client";

import { useRouter, useSearchParams } from "next/navigation";

const options = [
  { label: "All", value: "" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
] as const;

export default function StatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams);
    if (e.target.value) {
      params.set("status", e.target.value);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      {options.map(({ label, value }) => (
        <option key={value || "all"} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
