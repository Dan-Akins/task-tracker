import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { mapStripeSubscriptionStatus } from "@/lib/subscription";

// Stripe signs the raw request body, so it must be read as text before any
// JSON parsing touches it — re-serializing a parsed body would break
// signature verification.
async function verifyEvent(req: NextRequest): Promise<Stripe.Event> {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) throw new Error("Missing stripe-signature header.");
  return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
}

export async function POST(req: NextRequest) {
  let event: Stripe.Event;
  try {
    event = await verifyEvent(req);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = session.customer as string | null;
      const subscriptionId = session.subscription as string | null;
      if (userId && customerId && subscriptionId) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: mapStripeSubscriptionStatus(subscription.status),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { subscriptionStatus: "canceled" },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
