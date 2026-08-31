import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
  },
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(async () => {}),
}));

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { POST } from "./route";

const GENERIC_MESSAGE = "If an account exists for that email, we've sent a password reset link.";

function request(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost/api/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("POST /api/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the generic message and sends nothing when the account doesn't exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const response = await request({ email: "nobody@example.com" });
    const res = await POST(response);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe(GENERIC_MESSAGE);
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("stores a token and emails the link when the account exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_1", email: "user@example.com" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);

    const res = await POST(request({ email: "user@example.com" }, { host: "example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe(GENERIC_MESSAGE);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: expect.objectContaining({
        passwordResetTokenHash: expect.any(String),
        passwordResetTokenExpiresAt: expect.any(Date),
      }),
    });
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "user@example.com",
      expect.stringMatching(/^http:\/\/example\.com\/reset-password\?token=[a-f0-9]{64}$/),
    );
  });

  it("still returns the generic message when the email fails to send", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user_1", email: "user@example.com" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    vi.mocked(sendPasswordResetEmail).mockRejectedValue(new Error("send failed"));

    const res = await POST(request({ email: "user@example.com" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe(GENERIC_MESSAGE);
  });

  it("returns the generic message for a malformed email without querying the database", async () => {
    const res = await POST(request({ email: "not-an-email" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.message).toBe(GENERIC_MESSAGE);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("rejects the 31st request from the same IP within a minute", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const ip = "203.0.113.7";

    for (let i = 0; i < 30; i++) {
      const res = await POST(request({ email: "user@example.com" }, { "x-forwarded-for": ip }));
      expect(res.status).toBe(200);
    }

    const blocked = await POST(request({ email: "user@example.com" }, { "x-forwarded-for": ip }));
    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.error).toBe("Too many requests. Please try again in a minute.");
  });
});
