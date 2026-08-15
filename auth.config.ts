import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/signup";
      // /privacy must be readable before signing up, and shouldn't redirect
      // a logged-in visitor away either — unlike /login and /signup, it's
      // valid to view in both auth states.
      const isPublicPage = isAuthPage || nextUrl.pathname === "/privacy";

      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/", nextUrl));
      }
      if (!isLoggedIn && !isPublicPage) {
        return false;
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
