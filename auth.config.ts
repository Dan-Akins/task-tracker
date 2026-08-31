import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname === "/login" ||
        nextUrl.pathname === "/signup" ||
        nextUrl.pathname === "/forgot-password" ||
        nextUrl.pathname === "/reset-password";
      const isLandingPage = nextUrl.pathname === "/";
      // /privacy, /terms, and /pricing must be readable before signing up,
      // and shouldn't redirect a logged-in visitor away either — unlike
      // /login, /signup, and "/", they're valid to view in both auth states.
      const isPublicPage =
        isAuthPage ||
        isLandingPage ||
        nextUrl.pathname === "/privacy" ||
        nextUrl.pathname === "/terms" ||
        nextUrl.pathname === "/pricing";

      // The landing page at "/" is a marketing page for logged-out visitors;
      // a logged-in user gets the same treatment as hitting /login or
      // /signup while already signed in — sent straight to the app.
      if (isLoggedIn && (isAuthPage || isLandingPage)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      if (!isLoggedIn && !isPublicPage) {
        return false;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
