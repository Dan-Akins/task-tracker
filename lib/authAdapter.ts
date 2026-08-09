import type { Adapter } from "@auth/core/adapters";
import { prisma } from "@/lib/prisma";

function toAdapterUser(user: {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  image: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
    image: user.image,
  };
}

export const authAdapter: Adapter = {
  async getUser(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return toAdapterUser(user);
  },

  async getUserByEmail(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return toAdapterUser(user);
  },

  async createSession(session) {
    return prisma.session.create({ data: session });
  },

  async getSessionAndUser(sessionToken) {
    const result = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    if (!result || result.expires < new Date()) return null;
    const { user, ...session } = result;
    return { session, user: toAdapterUser(user) };
  },

  async updateSession({ sessionToken, expires }) {
    return prisma.session.update({
      where: { sessionToken },
      data: { expires: expires ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    });
  },

  async deleteSession(sessionToken) {
    await prisma.session.delete({ where: { sessionToken } }).catch(() => null);
  },
};
