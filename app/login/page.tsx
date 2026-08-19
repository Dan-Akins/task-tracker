"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import AuthEmailField from "@/app/components/auth/AuthEmailField";
import AuthPasswordField from "@/app/components/auth/AuthPasswordField";
import AuthFormError from "@/app/components/auth/AuthFormError";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <ThemeToggle />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8 dark:text-gray-50">Task Tracker Sign in</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700"
        >
          <AuthFormError message={error} />
          <AuthEmailField />
          <AuthPasswordField autoComplete="current-password" />

          <button
            type="submit"
            disabled={pending}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
          <Link href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
