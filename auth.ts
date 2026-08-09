import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { authAdapter } from "@/lib/authAdapter";
import { isRateLimited, recordFailure, resetAttempts } from "@/lib/rateLimit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: authAdapter,
  session: { strategy: "database" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = (credentials.email as string).toLowerCase().trim();
        if (isRateLimited(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          recordFailure(email);
          return null;
        }

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) {
          recordFailure(email);
          return null;
        }

        resetAttempts(email);
        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    session({ session, user, token }) {
      const id = user?.id ?? (token?.id as string | undefined);
      if (id) session.user.id = id;
      return session;
    },
  },
});
