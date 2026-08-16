export default function TaskCardSkeleton() {
  return (
    <li className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
      <span className="w-1.5 shrink-0 bg-gray-200 dark:bg-gray-700" />
      <div className="flex flex-col gap-2 flex-1 min-w-0 px-4 py-2.5 animate-pulse">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 w-2/5" />
          <div className="h-5 rounded-full bg-gray-200 dark:bg-gray-700 w-20 shrink-0" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-full" />
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-4/5" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-3 rounded bg-gray-200 dark:bg-gray-700 w-16" />
          <div className="h-8 rounded-md bg-gray-200 dark:bg-gray-700 w-16" />
        </div>
      </div>
    </li>
  );
}
