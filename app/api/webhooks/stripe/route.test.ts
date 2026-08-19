import { describe, it, expect, vi, afterEach, afterAll } from "vitest";
import { NextRequest } from "next/server";

// Real CRUD path against an in-memory pglite database, same harness as
// app/actions.integration.test.ts — only stripe.webhooks.constructEvent is
// mocked, since real signature verification needs a live Stripe secret.
vi.mock("@/lib/stripe", () => ({
  stripe: { webhooks: { constructEvent: vi.fn() } },
}));
vi.mock("@/lib/prisma", async () => {
  const { getTestDb } = await import("../../../../test/pglite-test-db");
  const { prisma } = await getTestDb();
  return { prisma };
});

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { POST } from "./route";
import { teardownTestDb } from "../../../../test/pglite-test-db";

function req(body: string, signature: string | null = "test-sig"): NextRequest {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body,
    headers: signature ? { "stripe-signature": signature } : {},
  });
}

let userCounter = 0;
async function createUser(overrides: Partial<{ stripeCustomerId: string; subscriptionStatus: "free" | "active" | "past_due" | "canceled" }> = {}) {
  userCounter += 1;
  return prisma.user.create({
    data: {
      email: `user-${userCounter}@example.com`,
      password: "hashed-password",
      ...overrides,
    },
  });
}

describe("POST /api/webhooks/stripe", () => {
  afterEach(async () => {
    vi.clearAllMocks();
    await prisma.task.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("rejects a request with no stripe-signature header", async () => {
    const res = await POST(req("{}", null));
    expect(res.status).toBe(400);
  });

  it("rejects a request with an invalid signature", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("bad signature");
    });
    const res = await POST(req("{}"));
    expect(res.status).toBe(400);
  });

  it("links the Stripe customer/subscription and activates the plan on checkout.session.completed", async () => {
    const user = await createUser();
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: { client_reference_id: user.id, customer: "cus_123", subscription: "sub_123" },
      },
    } as never);

    const res = await POST(req("{}"));

    expect(res.status).toBe(200);
    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.subscriptionStatus).toBe("active");
    expect(updated.stripeCustomerId).toBe("cus_123");
    expect(updated.stripeSubscriptionId).toBe("sub_123");
  });

  it("ignores checkout.session.completed with no client_reference_id", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { client_reference_id: null, customer: "cus_123", subscription: "sub_123" } },
    } as never);

    const res = await POST(req("{}"));
    expect(res.status).toBe(200);
  });

  it("syncs the mapped status from customer.subscription.updated", async () => {
    const user = await createUser({ stripeCustomerId: "cus_456", subscriptionStatus: "active" });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_456", customer: "cus_456", status: "past_due" } },
    } as never);

    await POST(req("{}"));

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.subscriptionStatus).toBe("past_due");
    expect(updated.stripeSubscriptionId).toBe("sub_456");
  });

  it("marks the plan canceled on customer.subscription.deleted", async () => {
    const user = await createUser({ stripeCustomerId: "cus_789", subscriptionStatus: "active" });
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_789", customer: "cus_789" } },
    } as never);

    await POST(req("{}"));

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(updated.subscriptionStatus).toBe("canceled");
  });

  it("no-ops without erroring when no user matches the customer id", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_999", customer: "cus_unknown" } },
    } as never);

    const res = await POST(req("{}"));
    expect(res.status).toBe(200);
  });

  it("acknowledges unhandled event types without error", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "invoice.paid",
      data: { object: {} },
    } as never);

    const res = await POST(req("{}"));
    expect(res.status).toBe(200);
  });
});
