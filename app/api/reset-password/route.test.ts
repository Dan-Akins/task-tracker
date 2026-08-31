import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
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
  return new NextRequest("http://localhost/api/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const VALID_PASSWORD = "Password1!";
const VALID_TOKEN = "a".repeat(64);

describe("POST /api/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a weak password without looking up the token", async () => {
    const res = await POST(request({ token: VALID_TOKEN, password: "weak" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Password must/);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects an unknown token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await POST(request({ token: VALID_TOKEN, password: VALID_PASSWORD }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("This reset link is invalid or has expired.");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("rejects an expired token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_1",
      passwordResetTokenExpiresAt: new Date(Date.now() - 1000),
    } as never);

    const res = await POST(request({ token: VALID_TOKEN, password: VALID_PASSWORD }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("This reset link is invalid or has expired.");
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("resets the password and clears the token on success", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_1",
      passwordResetTokenExpiresAt: new Date(Date.now() + 60_000),
    } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const res = await POST(request({ token: VALID_TOKEN, password: VALID_PASSWORD }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { password: "hashed", passwordResetTokenHash: null, passwordResetTokenExpiresAt: null },
    });
  });

  it("rejects the 31st request from the same IP within a minute", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const ip = "203.0.113.8";

    for (let i = 0; i < 30; i++) {
      const res = await POST(
        request({ token: VALID_TOKEN, password: VALID_PASSWORD }, { "x-forwarded-for": ip }),
      );
      expect(res.status).toBe(400);
    }

    const blocked = await POST(
      request({ token: VALID_TOKEN, password: VALID_PASSWORD }, { "x-forwarded-for": ip }),
    );
    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.error).toBe("Too many requests. Please try again in a minute.");
  });
});
