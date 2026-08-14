import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { PASSWORD_MAX_LENGTH } from "@/lib/validation";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { POST } from "./route";

function request(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
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
});
