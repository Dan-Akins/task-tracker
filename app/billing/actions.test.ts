import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
}));

import { auth } from "@/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { createCheckoutSession, createBillingPortalSession } from "./actions";

function mockSession(userId: string | null) {
  vi.mocked(auth).mockResolvedValue((userId ? { user: { id: userId } } : null) as never);
}

function mockHeaders(entries: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue({ get: (key: string) => entries[key] ?? null } as never);
}

describe("app/billing/actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaders({ host: "localhost:3000", "x-forwarded-proto": "http" });
    process.env.STRIPE_PRO_PRICE_ID = "price_test123";
  });

  describe("createCheckoutSession", () => {
    it("rejects an unauthenticated request", async () => {
      mockSession(null);
      await expect(createCheckoutSession()).rejects.toThrow();
      expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
    });

    it("reuses an existing Stripe customer id", async () => {
      mockSession("u1");
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        stripeCustomerId: "cus_existing",
      } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        url: "https://checkout.stripe.com/xyz",
      } as never);

      const url = await createCheckoutSession();

      expect(stripe.customers.create).not.toHaveBeenCalled();
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          customer: "cus_existing",
          client_reference_id: "u1",
          success_url: "http://localhost:3000/pricing?success=true",
          cancel_url: "http://localhost:3000/pricing?canceled=true",
          // Regression coverage: without this, Stripe accounts with Managed
          // Payments enabled reject the session unless the product carries
          // a tax code (see app/billing/actions.ts).
          managed_payments: { enabled: false },
        }),
      );
      expect(url).toBe("https://checkout.stripe.com/xyz");
    });

    it("creates and persists a Stripe customer when the user has none yet", async () => {
      mockSession("u1");
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        stripeCustomerId: null,
      } as never);
      vi.mocked(stripe.customers.create).mockResolvedValue({ id: "cus_new" } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
        url: "https://checkout.stripe.com/xyz",
      } as never);

      await createCheckoutSession();

      expect(stripe.customers.create).toHaveBeenCalledWith({
        email: "a@b.com",
        metadata: { userId: "u1" },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { stripeCustomerId: "cus_new" },
      });
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: "cus_new" }),
      );
    });

    it("throws when Stripe doesn't return a checkout URL", async () => {
      mockSession("u1");
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        stripeCustomerId: "cus_existing",
      } as never);
      vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({ url: null } as never);

      await expect(createCheckoutSession()).rejects.toThrow();
    });
  });

  describe("createBillingPortalSession", () => {
    it("rejects an unauthenticated request", async () => {
      mockSession(null);
      await expect(createBillingPortalSession()).rejects.toThrow();
      expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
    });

    it("throws when the user has no Stripe customer id yet", async () => {
      mockSession("u1");
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        stripeCustomerId: null,
      } as never);

      await expect(createBillingPortalSession()).rejects.toThrow();
    });

    it("creates a billing portal session for the user's customer", async () => {
      mockSession("u1");
      vi.mocked(prisma.user.findUniqueOrThrow).mockResolvedValue({
        id: "u1",
        email: "a@b.com",
        stripeCustomerId: "cus_existing",
      } as never);
      vi.mocked(stripe.billingPortal.sessions.create).mockResolvedValue({
        url: "https://billing.stripe.com/xyz",
      } as never);

      const url = await createBillingPortalSession();

      expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: "cus_existing",
        return_url: "http://localhost:3000/account",
      });
      expect(url).toBe("https://billing.stripe.com/xyz");
    });
  });
});
