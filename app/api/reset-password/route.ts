import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { BCRYPT_COST_FACTOR, validatePassword } from "@/lib/validation";
import { consumeWriteQuota, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!consumeWriteQuota(`reset-password:${ip}`)) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const token = body?.token;
  const password = body?.password;
  if (typeof token !== "string" || !token || typeof password !== "string" || !password) {
    return NextResponse.json({ error: "Token and password are required." }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { passwordResetTokenHash: hashToken(token) } });
  if (!user || !user.passwordResetTokenExpiresAt || user.passwordResetTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, BCRYPT_COST_FACTOR);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed, passwordResetTokenHash: null, passwordResetTokenExpiresAt: null },
  });

  return NextResponse.json({ success: true });
}
