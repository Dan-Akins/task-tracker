"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import AuthPasswordField from "@/app/components/auth/AuthPasswordField";
import AuthFormError from "@/app/components/auth/AuthFormError";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

type Props = {
  token: string;
};

export default function ResetPasswordForm({ token }: Props) {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.get("password") }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          Your password has been reset.
        </div>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AuthFormError message={error} />
      <AuthPasswordField
        autoComplete="new-password"
        minLength={PASSWORD_MIN_LENGTH}
        hint={`(${PASSWORD_MIN_LENGTH}+ chars, upper, lower, number, symbol)`}
      />

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}
