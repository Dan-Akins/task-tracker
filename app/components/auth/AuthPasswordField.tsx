type Props = {
  autoComplete: "current-password" | "new-password";
  minLength?: number;
  hint?: string;
};

export default function AuthPasswordField({ autoComplete, minLength, hint }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-400">
        Password
        {hint && <span className="ml-1 text-xs font-normal text-gray-400">{hint}</span>}
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:bg-gray-700 dark:border-gray-700 dark:text-gray-50 dark:placeholder:text-gray-400"
      />
    </div>
  );
}
