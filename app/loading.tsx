import TaskCardSkeleton from "@/app/components/TaskCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">

        <header className="flex items-center justify-between gap-3">
          <div className="animate-pulse space-y-1.5">
            <div className="h-6 rounded bg-gray-200 dark:bg-gray-700 w-36" />
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-12" />
          </div>
          <div className="flex items-center gap-2 animate-pulse">
            <div className="h-9 w-9 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="h-9 w-20 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </header>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-full max-w-[600px] mx-auto animate-pulse space-y-4 dark:bg-gray-800 dark:border-gray-700">
          <div className="h-5 rounded bg-gray-200 dark:bg-gray-700 w-24" />
          <div className="space-y-1.5">
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-10" />
            <div className="h-9 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-20" />
            <div className="h-20 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="flex justify-end">
            <div className="h-9 w-24 rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-20 mb-3 animate-pulse" />
            <ul className="space-y-3">
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </ul>
          </section>
          <section>
            <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-12 mb-3 animate-pulse" />
            <ul className="space-y-3">
              <TaskCardSkeleton />
            </ul>
          </section>
        </div>

      </div>
    </div>
  );
}
