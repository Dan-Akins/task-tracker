import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Task Tracker",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">Privacy Policy</h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">Last updated: August 14, 2026</p>
        </header>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">What we collect</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We collect your email address to create and authenticate your account, and your password
              (stored as a one-way hash — we never store or have access to your actual password). We also
              store the task data you enter: titles, descriptions, statuses, priorities, due dates, and
              categories.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">How we use it</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your email and password are used solely to sign you in. Your task data is used solely to
              provide the task-tracking features of this app to you. We don&rsquo;t use your data for
              advertising, profiling, or any purpose beyond running the app.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Third parties</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We do not sell, rent, or share your data with third parties. Your data is stored using
              standard cloud hosting and database infrastructure providers, which process it on our behalf
              to run the app and do not use it for their own purposes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Data retention and deletion</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can permanently delete your account and every task you&rsquo;ve created at any time from
              your{" "}
              <Link href="/account" className="text-blue-600 font-medium hover:underline dark:text-blue-400">
                Account page
              </Link>
              . This is immediate and cannot be undone.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Cookies</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We use a single essential cookie to keep you signed in. It isn&rsquo;t used for tracking or
              advertising, and the app won&rsquo;t function without it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">Questions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              If you have questions about this policy or your data, contact the person who administers
              this app.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
