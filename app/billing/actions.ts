"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { stripe } from "@/lib/stripe";

async function getOrigin(): Promise<string> {
  const headerList = await headers();
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("host");
  return `${protocol}://${host}`;
}

async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create({ email, metadata: { userId } });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

export async function createCheckoutSession(): Promise<string> {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const customerId = await getOrCreateStripeCustomerId(userId, user.email);
  const origin = await getOrigin();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/pricing?success=true`,
    cancel_url: `${origin}/pricing?canceled=true`,
    // This app remains merchant of record and doesn't use Stripe Tax, so
    // opt out of Managed Payments — otherwise Stripe requires every Price's
    // product to carry a tax code before Checkout will accept it.
    managed_payments: { enabled: false },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL.");
  return session.url;
}

export async function createBillingPortalSession(): Promise<string> {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.stripeCustomerId) throw new Error("No billing account found for this user.");

  const origin = await getOrigin();
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/account`,
  });

  return session.url;
}
