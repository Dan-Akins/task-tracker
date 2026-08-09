import { NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = new Set(["/login", "/signup"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.has(pathname);

  // Check both dev and prod cookie names (prefix depends on HTTPS)
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  // Block unauthenticated access to protected routes.
  // Don't redirect authenticated users away from auth pages here —
  // that's handled in server components to avoid stale-cookie loops.
  if (!hasSession && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
