"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import AuthEmailField from "@/app/components/auth/AuthEmailField";
import AuthFormError from "@/app/components/auth/AuthFormError";

export default function ForgotPasswordPage() {
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      // Any other response (including a generic failure) still shows the
      // same success state — this endpoint never reveals whether the email
      // matched an account.
      setSubmitted(true);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8 dark:text-gray-50">
          Reset your password
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">
          {submitted ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              If an account exists for that email, we&rsquo;ve sent a password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <AuthFormError message={error} />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enter your email and we&rsquo;ll send you a link to reset your password.
              </p>
              <AuthEmailField />

              <button
                type="submit"
                disabled={pending}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {pending ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
