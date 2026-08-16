"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthEmailField from "@/app/components/auth/AuthEmailField";
import AuthPasswordField from "@/app/components/auth/AuthPasswordField";
import AuthFormError from "@/app/components/auth/AuthFormError";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    setError("");

    startTransition(async () => {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Try logging in.");
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-8 dark:text-gray-50">Create account</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700"
        >
          <AuthFormError message={error} />
          <AuthEmailField />
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
            {pending ? "Creating account…" : "Create account"}
          </button>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        <p className="mt-4 text-xs text-center text-gray-400 dark:text-gray-500">
          By creating an account, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-gray-600 dark:hover:text-gray-300">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
