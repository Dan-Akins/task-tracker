import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import {
  isRateLimited,
  recordFailure,
  resetAttempts,
  isIpRateLimited,
  recordIpFailure,
  resetIpAttempts,
  getClientIp,
} from "@/lib/rateLimit";
import { EMAIL_MAX_LENGTH, PASSWORD_MAX_LENGTH } from "@/lib/validation";

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

        const rawEmail = credentials.email as string;
        const rawPassword = credentials.password as string;
        if (rawEmail.length > EMAIL_MAX_LENGTH || rawPassword.length > PASSWORD_MAX_LENGTH) {
          return null;
        }

        const email = rawEmail.toLowerCase().trim();
        const ip = getClientIp(request);
        if (isRateLimited(email) || isIpRateLimited(ip)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          recordFailure(email);
          recordIpFailure(ip);
          return null;
        }

        const valid = await bcrypt.compare(rawPassword, user.password);
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
