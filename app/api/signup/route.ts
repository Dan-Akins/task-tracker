import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, validateEmail } from "@/lib/validation";
import { consumeWriteQuota, getClientIp, RATE_LIMIT_MESSAGE } from "@/lib/rateLimit";

// OWASP-recommended minimum bcrypt work factor; the cost is embedded in the
// hash itself, so raising this later doesn't invalidate existing hashes.
const BCRYPT_COST_FACTOR = 12;

function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must contain at least one special character.";
  return null;
}

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
