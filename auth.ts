import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import {
  isRateLimited,
  recordFailure,
  resetAttempts,
  isIpRateLimited,
  recordIpFailure,
  resetIpAttempts,
} from "@/lib/rateLimit";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        const ip = getClientIp(request);
        if (isRateLimited(email) || isIpRateLimited(ip)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          recordFailure(email);
          recordIpFailure(ip);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) {
          recordFailure(email);
          recordIpFailure(ip);
          return null;
        }

        resetAttempts(email);
        resetIpAttempts(ip);
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
