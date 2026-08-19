"use client";

import { useState, useTransition } from "react";
import { createCheckoutSession } from "@/app/billing/actions";

export default function UpgradeButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    startTransition(async () => {
      try {
        const url = await createCheckoutSession();
        window.location.href = url;
      } catch {
        setError("Couldn't start checkout. Please try again.");
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
          "w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        }
      >
        {pending ? "Redirecting…" : "Upgrade to Pro"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
