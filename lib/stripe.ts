import Stripe from "stripe";

function makeStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const globalForStripe = globalThis as unknown as { stripe: Stripe };
export const stripe = globalForStripe.stripe ?? makeStripe();
if (process.env.NODE_ENV !== "production") globalForStripe.stripe = stripe;
