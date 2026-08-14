import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">404</p>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Page not found</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have been moved.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
