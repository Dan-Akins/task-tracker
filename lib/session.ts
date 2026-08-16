import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/auth";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function requireSession(): Promise<Session & { user: { id: string } }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}
