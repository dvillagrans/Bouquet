import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sessionCookieName, blacklistToken, sessionCookieOptions } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get(sessionCookieName())?.value;
  if (sessionToken) {
    blacklistToken(sessionToken);
  }

  const adminToken = cookieStore.get("bq_admin_session")?.value;
  if (adminToken) {
    blacklistToken(adminToken);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  // Limpiar cookie legacy también
  res.cookies.set("bq_admin_session", "", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return res;
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
