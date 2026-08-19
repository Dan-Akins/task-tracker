import Link from "next/link";
import { UPGRADE_PROMPT_MESSAGE } from "@/lib/subscription";

export default function UpgradePrompt() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
      <p className="text-sm text-blue-900 dark:text-blue-200">{UPGRADE_PROMPT_MESSAGE}</p>
      <Link
        href="/pricing"
        className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Upgrade
      </Link>
    </div>
  );
}
