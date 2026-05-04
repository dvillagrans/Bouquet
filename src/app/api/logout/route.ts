import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookieName, blacklistToken } from "@/lib/auth-session";
import { adminSessionCookieName } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(sessionCookieName())?.value;
  if (sessionToken) {
    blacklistToken(sessionToken);
  }

  const adminToken = cookieStore.get(adminSessionCookieName())?.value;
  if (adminToken) {
    blacklistToken(adminToken);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), "", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 0,
  });
  // Limpiar cookie legacy también
  res.cookies.set(adminSessionCookieName(), "", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    maxAge: 0,
  });
  return res;
}
