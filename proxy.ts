import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextProxy, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

const ALLOWED_ORIGINS = [
  // Confirmed via `vercel alias ls` — task-tracker.vercel.app was never
  // actually assigned to this project; these are the real production aliases.
  "https://task-tracker-team-camdan.vercel.app",
  "https://task-tracker-kappa-five-39.vercel.app",
  "https://task-tracker-git-master-team-camdan.vercel.app",
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

function applyApiCors(req: NextRequest): NextResponse {
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

// Next.js 16 allows only a single proxy/middleware file, so the session-based
// page redirect (NextAuth's `auth` used as middleware) and the API CORS check
// are combined here, branching on the path instead of relying on separate
// matchers in separate files.
//
// `auth`'s declared type is an intersection of five unrelated call shapes
// (session getter, API route helper, App Router handler wrapper, middleware
// wrapper, ...), and TypeScript's `Parameters<>`/`ReturnType<>` utility types
// resolve an intersection using only its *last* member — not the "called
// directly as the proxy default export" shape this file actually relies on.
// Cast once to the concrete proxy shape NextAuth implements here.
const authMiddleware = NextAuth(authConfig).auth as unknown as NextProxy;

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (req.nextUrl.pathname.startsWith("/api")) {
    return applyApiCors(req);
  }
  return authMiddleware(req, event);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
