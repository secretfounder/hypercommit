import "server-only";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Session } from "@/lib/auth";

export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}
