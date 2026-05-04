import { NextResponse } from "next/server";
import { adminSessionCookieName } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });
  return res;
}
