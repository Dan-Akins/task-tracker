import Stripe from "stripe";

function makeStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

const globalForStripe = globalThis as unknown as { stripe?: Stripe };
let cachedStripe: Stripe | undefined = globalForStripe.stripe;

function getStripe(): Stripe {
  if (!cachedStripe) {
    cachedStripe = makeStripe();
    if (process.env.NODE_ENV !== "production") globalForStripe.stripe = cachedStripe;
  }
  return cachedStripe;
}

// Unlike PrismaClient (lib/prisma.ts), which only fails on first query,
// Stripe's constructor validates the API key eagerly and throws if it's
// missing. Next.js evaluates route modules during build-time page-data
// collection just to inspect their exports, so an eager `new Stripe(...)`
// here would fail an entire deploy that simply hasn't configured
// STRIPE_SECRET_KEY yet — even though nothing tried to call Stripe. This
// Proxy defers construction until something actually uses the client.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return Reflect.get(getStripe(), prop);
  },
});
