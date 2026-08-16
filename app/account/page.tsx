import Link from "next/link";
import { requireSession } from "@/lib/session";
import DeleteAccountButton from "@/app/components/account/DeleteAccountButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">Account</h1>
        </header>

        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to tasks
        </Link>

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-1 dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-400">Email</p>
          <p className="text-sm text-gray-900 dark:text-gray-50">{session.user.email}</p>
        </section>

        <section className="bg-white border border-red-200 rounded-lg shadow-sm p-4 space-y-3 dark:bg-gray-800 dark:border-red-900/50">
          <div>
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Delete account</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Permanently deletes your account and every task you&rsquo;ve created. This cannot be undone.
            </p>
          </div>
          <DeleteAccountButton />
        </section>
      </div>
    </div>
  );
}
