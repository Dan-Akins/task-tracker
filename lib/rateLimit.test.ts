import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isRateLimited,
  recordFailure,
  resetAttempts,
  isIpRateLimited,
  recordIpFailure,
  resetIpAttempts,
} from "./rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("is not rate limited when no attempts have been recorded", () => {
    expect(isRateLimited("new@example.com")).toBe(false);
  });

  it("is not rate limited before reaching the max attempts", () => {
    const key = "under-limit@example.com";
    for (let i = 0; i < 4; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(false);
  });

  it("is rate limited once the max attempts is reached", () => {
    const key = "over-limit@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);
  });

  it("stops being rate limited after the window expires", () => {
    const key = "expired@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);

    vi.setSystemTime(new Date("2026-01-01T00:15:00.001Z"));
    expect(isRateLimited(key)).toBe(false);
  });

  it("resets the counter after the window expires instead of accumulating", () => {
    const key = "reset-window@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);

    vi.setSystemTime(new Date("2026-01-01T00:15:00.001Z"));
    recordFailure(key);
    expect(isRateLimited(key)).toBe(false);
  });

  it("resetAttempts clears the record so the key is no longer limited", () => {
    const key = "cleared@example.com";
    for (let i = 0; i < 5; i++) recordFailure(key);
    expect(isRateLimited(key)).toBe(true);

    resetAttempts(key);
    expect(isRateLimited(key)).toBe(false);
  });
});
