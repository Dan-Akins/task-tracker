import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "https://task-tracker.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");

  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: origin ? corsHeaders(origin) : undefined,
    });
  }

  const res = NextResponse.next();
  if (origin) {
    for (const [key, value] of Object.entries(corsHeaders(origin))) {
      res.headers.set(key, value);
    }
  }
  return res;
}

export const config = {
  matcher: "/api/:path*",
};
