import { NextResponse, type NextRequest } from "next/server";
import { handlers } from "@/auth";
import { consumeReadQuota, consumeWriteQuota, getClientIp } from "@/lib/rateLimit";

function tooManyRequests() {
  return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
}

export async function GET(req: NextRequest) {
  if (!consumeReadQuota(`auth-get:${getClientIp(req)}`)) return tooManyRequests();
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  if (!consumeWriteQuota(`auth-post:${getClientIp(req)}`)) return tooManyRequests();
  return handlers.POST(req);
}
