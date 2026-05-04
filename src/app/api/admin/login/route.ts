import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-password";
import {
  createSessionToken,
  resolveAuthSecret,
  sessionCookieName,
} from "@/lib/auth-session";
import { rateLimit } from "@/lib/rate-limit";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestIp = (await headers()).get("x-forwarded-for") ?? "unknown";

  if (!rateLimit(`${requestIp}:login`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: "Demasiados intentos. Inténtalo más tarde." },
      { status: 429 }
    );
  }

  const secret = resolveAuthSecret();
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
        include: { role: { select: { name: true } } },
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

  const roleNames = user.userRoles.map((ur) => ur.role.name);
  const token = await createSessionToken(secret, 24 * 60 * 60 * 1000, {
    appUserId: user.id,
    roles: roleNames,
  });

  createAuditLog({
    actorUserId: user.id,
    action: "LOGIN",
    entityType: "AppUser",
    entityId: user.id,
    ipAddress: requestIp,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return res;
}
