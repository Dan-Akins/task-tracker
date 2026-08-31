import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PASSWORD_RESET_TOKEN_BYTES, PASSWORD_RESET_TOKEN_TTL_MS, validateEmail } from "@/lib/validation";
import { consumeWriteQuota, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";
import { sendPasswordResetEmail } from "@/lib/email";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function getOrigin(req: NextRequest): Promise<string> {
  const protocol = req.headers.get("x-forwarded-proto") ?? "http";
  const host = req.headers.get("host");
  return `${protocol}://${host}`;
}

const GENERIC_MESSAGE = "If an account exists for that email, we've sent a password reset link.";

// Always returns the same generic message regardless of whether the email
// belongs to an account, so this endpoint can't be used to enumerate users.
// A fresh Response is built per call — a shared instance's body stream can
// only be consumed once, which would break every request after the first.
function genericResponse(): NextResponse {
  return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!consumeWriteQuota(`forgot-password:${ip}`)) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = body?.email;
  if (typeof email !== "string" || !email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  if (validateEmail(normalizedEmail)) return genericResponse();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) return genericResponse();

  const rawToken = crypto.randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: hashToken(rawToken),
      passwordResetTokenExpiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    },
  });

  const origin = await getOrigin(req);
  try {
    await sendPasswordResetEmail(normalizedEmail, `${origin}/reset-password?token=${rawToken}`);
  } catch (err) {
    // Swallowed deliberately: surfacing send failures here would let a
    // caller distinguish "account exists but email failed" from the
    // generic response, defeating the anti-enumeration behavior above.
    console.error("Failed to send password reset email:", err);
  }

  return genericResponse();
}
