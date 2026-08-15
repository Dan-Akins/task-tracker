"use client";

import { useTransition } from "react";
import { deleteAccount } from "@/app/actions";

export default function DeleteAccountButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const confirmed = window.confirm(
      "Delete your account? This permanently deletes your account and every task you've created. This cannot be undone.",
    );
    if (!confirmed) return;
    startTransition(() => deleteAccount());
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Deleting…" : "Delete my account"}
    </button>
  );
}
