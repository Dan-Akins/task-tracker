import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isPro } from "@/lib/subscription";
import PricingCard from "@/app/components/billing/PricingCard";
import UpgradeButton from "@/app/components/billing/UpgradeButton";
import ManageBillingButton from "@/app/components/billing/ManageBillingButton";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ success?: string; canceled?: string }>;

export default async function PricingPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  const { success, canceled } = await searchParams;

  const user = session?.user?.id
    ? await prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { subscriptionStatus: true },
      })
    : null;
  const userIsPro = user ? isPro(user.subscriptionStatus) : false;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">Pricing</h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">
            Simple plans, no surprises.
          </p>
        </header>

        {success === "true" && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
            You&rsquo;re on the Pro plan now. Thanks for upgrading!
          </div>
        )}
        {canceled === "true" && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            Checkout was canceled — you weren&rsquo;t charged.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <PricingCard
            name="Free"
            price="$0"
            priceSuffix="/month"
            features={["Up to 10 tasks", "Basic task management"]}
            cta={
              !session ? (
                <Link
                  href="/signup"
                  className="block w-full rounded-md border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Sign up free
                </Link>
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {userIsPro ? "Included in Pro" : "Your current plan"}
                </p>
              )
            }
          />

          <PricingCard
            name="Pro"
            price="$5"
            priceSuffix="/month"
            highlighted
            features={["Unlimited tasks", "Priority support"]}
            cta={
              !session ? (
                <Link
                  href="/signup"
                  className="block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Sign up to upgrade
                </Link>
              ) : userIsPro ? (
                <ManageBillingButton className="w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700" />
              ) : (
                <UpgradeButton />
              )
            }
          />
        </div>

        <Link
          href={session ? "/" : "/login"}
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {session ? "Back to homepage" : "Back to login"}
        </Link>
      </div>
    </div>
  );
}
