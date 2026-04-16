import { NextResponse } from "next/server";
import {
  adminSessionCookieName,
  createAdminSessionToken,
  resolveAdminAuthSecret,
} from "@/lib/admin-session";
import { prisma } from "@/lib/prisma";
import { verifySuperAdminPassword } from "@/lib/super-admin-password";

export const dynamic = "force-dynamic";

const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function POST(req: Request) {
  const secret = resolveAdminAuthSecret();
  if (!secret) {
    return NextResponse.json({ ok: false, error: "BOUQUET_ADMIN_AUTH_SECRET no está configurada." }, { status: 503 });
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Cuerpo inválido." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  const givenPassword = body.password ?? "";
  if (!email || !givenPassword) {
    return NextResponse.json({ ok: false, error: "Indica correo y contraseña." }, { status: 400 });
  }

  const row = await prisma.superAdmin.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, isActive: true },
  });
  if (!row?.isActive) {
    return NextResponse.json({ ok: false, error: "Credenciales incorrectas." }, { status: 401 });
  }

  const okPass = await verifySuperAdminPassword(givenPassword, row.passwordHash);
  if (!okPass) {
    return NextResponse.json({ ok: false, error: "Credenciales incorrectas." }, { status: 401 });
  }

  const token = await createAdminSessionToken(secret, TTL_MS, { superAdminId: row.id });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: Math.floor(TTL_MS / 1000),
  });
  return res;
}
