// One-time setup script: creates the "Task Tracker Pro" Product and its
// $5/month Price in Stripe via the API, then prints the Price ID to paste
// into .env.local as STRIPE_PRO_PRICE_ID. Safe to re-run — it looks the
// price up by a fixed lookup_key first instead of creating a duplicate.
//
// Usage:
//   npm run stripe:setup                    # loads .env.local
//   npm run stripe:setup -- .env.production.local

import { config } from "dotenv";

const envFile = process.argv[2] ?? ".env.local";
config({ path: envFile });

const PRICE_LOOKUP_KEY = "task_tracker_pro_monthly";
const PRO_PRICE_USD_CENTS = 500;

async function main() {
  // Loaded dynamically, after config() has run, since the Stripe client
  // reads process.env.STRIPE_SECRET_KEY at import time (lib/prisma.ts's
  // DATABASE_URL has the same constraint — see scripts/backup.ts).
  const { stripe } = await import("@/lib/stripe");

  const existing = await stripe.prices.list({ lookup_keys: [PRICE_LOOKUP_KEY], limit: 1 });
  if (existing.data.length > 0) {
    console.log(`Price already exists: ${existing.data[0].id}`);
    console.log("Set STRIPE_PRO_PRICE_ID to this value in .env.local if it isn't already.");
    return;
  }

  const product = await stripe.products.create({
    name: "Task Tracker Pro",
    description: "Unlimited tasks and priority support.",
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRO_PRICE_USD_CENTS,
    currency: "usd",
    recurring: { interval: "month" },
    lookup_key: PRICE_LOOKUP_KEY,
  });

  console.log(`Created product ${product.id} and price ${price.id}`);
  console.log(`Set STRIPE_PRO_PRICE_ID="${price.id}" in .env.local`);
}

main().catch((err) => {
  console.error("Stripe setup failed:", err);
  process.exitCode = 1;
});
