import type Stripe from "stripe";
import { SubscriptionStatus } from "@/app/generated/prisma/enums";

export const FREE_TASK_LIMIT = 10;

export const UPGRADE_PROMPT_MESSAGE = `You've reached the ${FREE_TASK_LIMIT}-task limit on the Free plan. Upgrade to Pro for unlimited tasks.`;

export const PRO_PLAN_PRICE_USD = 5;

// Shared plan display data for PricingCard, used on both the landing page and
// /pricing — CTAs differ per page (session/subscription-aware vs. static), so
// those stay defined at each call site instead of living here.
export const FREE_PLAN = {
  name: "Free",
  price: "$0",
  priceSuffix: "/month",
  features: [`Up to ${FREE_TASK_LIMIT} tasks`, "Basic task management"],
};

export const PRO_PLAN = {
  name: "Pro",
  price: `$${PRO_PLAN_PRICE_USD}`,
  priceSuffix: "/month",
  features: ["Unlimited tasks", "Priority support"],
};

export function isPro(status: SubscriptionStatus): boolean {
  return status === "active";
}

export const SUBSCRIPTION_STATUS_META: Record<SubscriptionStatus, { label: string; badge: string }> = {
  free: { label: "Free", badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400" },
  active: { label: "Pro", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  past_due: {
    label: "Past due",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  canceled: { label: "Canceled", badge: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400" },
};

// Stripe has more statuses than we track (trialing, incomplete, unpaid,
// paused, ...) — this app has no trials, so anything that isn't clearly
// "paid and current" collapses to past_due (still shown as a payment
// problem) or canceled, never silently back to a fresh "free" state.
const STRIPE_STATUS_MAP: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
  active: "active",
  trialing: "active",
  past_due: "past_due",
  unpaid: "past_due",
  incomplete: "past_due",
  incomplete_expired: "canceled",
  canceled: "canceled",
  paused: "canceled",
};

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  return STRIPE_STATUS_MAP[status];
}
