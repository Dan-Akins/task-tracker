"use client";

import { useEffect } from "react";
import "./globals.css";

// Catches errors thrown by the root layout itself, which app/error.tsx cannot
// catch (it's rendered inside that same layout). Must render its own
// <html>/<body> since it replaces the root layout entirely.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 antialiased">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-red-600">500</p>
            <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
            <p className="text-sm text-gray-500">
              An unexpected error occurred on our end. Please try again, or head back to the homepage.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400">Reference: {error.digest}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => reset()}
              className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Try again
            </button>
            <a
              href="/"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Back to homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
