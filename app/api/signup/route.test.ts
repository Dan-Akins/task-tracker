import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PASSWORD_MAX_LENGTH } from "@/lib/validation";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));
// Real bcrypt at cost 12 is deliberately slow; tests that loop past the
// rate limit would otherwise take several seconds each.
vi.mock("bcryptjs", () => ({
  default: { hash: vi.fn(async () => "hashed") },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "./route";

function request(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const VALID_PASSWORD = "Password1!";

describe("POST /api/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
  });

  it("rejects a password over the max length and persists nothing", async () => {
    const response = await POST(request({
      email: "user@example.com",
      password: "Aa1!".repeat(40), // 160 chars, over the 128 max
    }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe(`Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("accepts a password at exactly the max length", async () => {
    const password = "Aa1!".repeat(PASSWORD_MAX_LENGTH / 4);
    expect(password).toHaveLength(PASSWORD_MAX_LENGTH);
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);

    const response = await POST(request({ email: "user@example.com", password }));

    expect(response.status).toBe(200);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
  });

  it("rejects an email over the max length", async () => {
    const overlong = "a".repeat(255) + "@example.com";
    const response = await POST(request({ email: overlong, password: VALID_PASSWORD }));

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toBe("Enter a valid email address.");
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects the 31st signup from the same IP within a minute", async () => {
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    const ip = "203.0.113.5";

    for (let i = 0; i < 30; i++) {
      const res = await POST(
        request(
          { email: `user${i}@example.com`, password: VALID_PASSWORD },
          { "x-forwarded-for": ip },
        ),
      );
      expect(res.status).toBe(200);
    }

    const blocked = await POST(
      request({ email: "user30@example.com", password: VALID_PASSWORD }, { "x-forwarded-for": ip }),
    );

    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.error).toBe("Too many requests. Please try again in a minute.");
    expect(prisma.user.create).toHaveBeenCalledTimes(30);
  });

  it("does not rate-limit a different IP after one IP is exhausted", async () => {
    vi.mocked(prisma.user.create).mockResolvedValue({} as never);
    for (let i = 0; i < 30; i++) {
      await POST(
        request(
          { email: `otheruser${i}@example.com`, password: VALID_PASSWORD },
          { "x-forwarded-for": "203.0.113.9" },
        ),
      );
    }

    const fromAnotherIp = await POST(
      request(
        { email: "fresh@example.com", password: VALID_PASSWORD },
        { "x-forwarded-for": "198.51.100.1" },
      ),
    );

    expect(fromAnotherIp.status).toBe(200);
  });
});
