import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/admin-session";
import { sessionCookieOptions } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
  return res;
}
