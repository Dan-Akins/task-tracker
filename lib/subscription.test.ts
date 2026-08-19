import { describe, it, expect } from "vitest";
import { isPro, mapStripeSubscriptionStatus, SUBSCRIPTION_STATUS_META } from "./subscription";
import { SubscriptionStatus } from "@/app/generated/prisma/enums";

describe("isPro", () => {
  it("is true only for an active subscription", () => {
    expect(isPro("active")).toBe(true);
    expect(isPro("free")).toBe(false);
    expect(isPro("past_due")).toBe(false);
    expect(isPro("canceled")).toBe(false);
  });
});

describe("mapStripeSubscriptionStatus", () => {
  it("maps active and trialing to active", () => {
    expect(mapStripeSubscriptionStatus("active")).toBe("active");
    expect(mapStripeSubscriptionStatus("trialing")).toBe("active");
  });

  it("maps payment-trouble statuses to past_due", () => {
    expect(mapStripeSubscriptionStatus("past_due")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("unpaid")).toBe("past_due");
    expect(mapStripeSubscriptionStatus("incomplete")).toBe("past_due");
  });

  it("maps ended statuses to canceled", () => {
    expect(mapStripeSubscriptionStatus("canceled")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("incomplete_expired")).toBe("canceled");
    expect(mapStripeSubscriptionStatus("paused")).toBe("canceled");
  });
});

describe("SUBSCRIPTION_STATUS_META", () => {
  it("has an entry for every SubscriptionStatus value", () => {
    const statuses: SubscriptionStatus[] = ["free", "active", "past_due", "canceled"];
    for (const status of statuses) {
      expect(SUBSCRIPTION_STATUS_META[status]).toBeDefined();
      expect(SUBSCRIPTION_STATUS_META[status].label).toBeTruthy();
    }
  });
});
