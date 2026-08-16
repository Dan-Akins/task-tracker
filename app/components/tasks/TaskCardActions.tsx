"use client";

import { deleteTask } from "@/app/actions";

type Props = {
  id: number;
  pending: boolean;
  onCycle: () => void;
  actionLabel: string;
  actionStyle: string;
};

export default function TaskCardActions({ id, pending, onCycle, actionLabel, actionStyle }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onCycle}
        disabled={pending}
        className={`rounded-md px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${actionStyle}`}
      >
        {pending ? "…" : actionLabel}
      </button>
      <form action={deleteTask.bind(null, id)}>
        <button
          type="submit"
          aria-label="Delete task"
          onClick={(e) => { if (!window.confirm("Delete this task?")) e.preventDefault(); }}
          className="text-gray-400 hover:text-red-500 transition-colors dark:text-gray-500 dark:hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
