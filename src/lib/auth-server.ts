import { cookies } from "next/headers";
import {
  sessionCookieName,
  resolveAuthSecret,
  verifySessionToken,
} from "@/lib/auth-session";

export async function getCurrentSession() {
  const secret = resolveAuthSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;

  return verifySessionToken(token, secret);
}
