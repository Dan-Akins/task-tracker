import Link from "next/link";
import PricingCard from "@/app/components/billing/PricingCard";

export const metadata = {
  title: "Task Tracker — Organize your work, finish what matters",
  description: "Task Tracker keeps your to-dos, priorities, and deadlines in one simple place.",
};

const FEATURES = [
  {
    title: "Stay organized",
    description: "Set priorities, due dates, and categories so nothing slips through the cracks.",
    icon: (
      <>
        <rect x="3" y="4" width="6" height="6" rx="1" />
        <path d="M4.5 7l1 1 2-2" />
        <path d="M13 5h8" />
        <rect x="3" y="14" width="6" height="6" rx="1" />
        <path d="M4.5 17l1 1 2-2" />
        <path d="M13 15h8" />
      </>
    ),
  },
  {
    title: "Track your progress",
    description: "See exactly what's done, in progress, and still to do at a glance.",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <rect x="7" y="13" width="3" height="5" />
        <rect x="12" y="9" width="3" height="9" />
        <rect x="17" y="5" width="3" height="13" />
      </>
    ),
  },
  {
    title: "Simple & secure",
    description: "No clutter, no learning curve — just a fast, focused way to manage your tasks.",
    icon: (
      <>
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />
        <path d="M9.5 12l2 2 3.5-3.5" />
      </>
    ),
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">Task Tracker</span>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-50"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl dark:text-gray-50">
          Organize your work, finish what matters.
        </h1>
        <p className="mt-4 text-base text-gray-600 sm:text-lg dark:text-gray-400">
          Task Tracker keeps your to-dos, priorities, and deadlines in one simple place — free to
          start, no credit card required.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Get Started
          </Link>
          <Link
            href="#pricing"
            className="rounded-md border border-gray-200 bg-white px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            See pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {feature.icon}
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-gray-50">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">Simple pricing</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Start free. Upgrade when you outgrow it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <PricingCard
            name="Free"
            price="$0"
            priceSuffix="/month"
            features={["Up to 10 tasks", "Basic task management"]}
            cta={
              <Link
                href="/signup"
                className="block w-full rounded-md border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sign up free
              </Link>
            }
          />
          <PricingCard
            name="Pro"
            price="$5"
            priceSuffix="/month"
            highlighted
            features={["Unlimited tasks", "Priority support"]}
            cta={
              <Link
                href="/signup"
                className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Get Started
              </Link>
            }
          />
        </div>
      </section>

      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:justify-between sm:px-6 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Task Tracker.</p>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-gray-50">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-gray-900 dark:hover:text-gray-50">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-gray-900 dark:hover:text-gray-50">
              Sign up
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-50">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
