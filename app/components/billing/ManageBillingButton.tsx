"use client";

import { useState, useTransition } from "react";
import { createBillingPortalSession } from "@/app/billing/actions";

export default function ManageBillingButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    startTransition(async () => {
      try {
        const url = await createBillingPortalSession();
        window.location.href = url;
      } catch {
        setError("Couldn't open billing portal. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={
          className ??
          "bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
        }
      >
        {pending ? "Redirecting…" : "Manage billing"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
