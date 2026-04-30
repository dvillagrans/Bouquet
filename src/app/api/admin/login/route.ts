import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-password";
import { createAdminSessionToken, resolveAdminAuthSecret } from "@/lib/admin-session";
import { adminSessionCookieName } from "@/lib/admin-session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = resolveAdminAuthSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "Servidor sin AUTH_SECRET configurado." },
      { status: 503 }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Faltan credenciales." }, { status: 400 });
  }

  const user = await prisma.appUser.findUnique({
    where: { email },
    include: {
      userRoles: {
        where: { role: { scope: "PLATFORM" } },
        select: { id: true },
      },
    },
  });

  if (!user || !user.isActive || user.archivedAt) {
    return NextResponse.json({ ok: false, error: "Credenciales incorrectas." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Credenciales incorrectas." }, { status: 401 });
  }

  // Solo usuarios con rol de plataforma pueden acceder al admin
  if (user.userRoles.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Acceso denegado: no tienes permisos de administrador." },
      { status: 403 }
    );
  }

  const token = await createAdminSessionToken(secret, 24 * 60 * 60 * 1000, {
    appUserId: user.id,
    roles: ["platform_admin"],
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return res;
}
