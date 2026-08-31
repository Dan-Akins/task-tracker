import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { BCRYPT_COST_FACTOR, validateEmail, validatePassword } from "@/lib/validation";
import { consumeWriteQuota, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!consumeWriteQuota(`signup:${ip}`)) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailError = validateEmail(normalizedEmail);
  if (emailError) {
    return NextResponse.json({ error: emailError }, { status: 400 });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, BCRYPT_COST_FACTOR);
  await prisma.user.create({ data: { email: normalizedEmail, password: hashed } });

  return NextResponse.json({ success: true });
}
