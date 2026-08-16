export default function AuthEmailField() {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-400">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50 dark:placeholder:text-gray-400"
      />
    </div>
  );
}
