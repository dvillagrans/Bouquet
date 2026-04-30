import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-password";
import {
  createSessionToken,
  resolveAuthSecret,
  sessionCookieName,
} from "@/lib/auth-session";

export const dynamic = "force-dynamic";

function resolveRedirectPath(roleNames: string[]): string {
  // Prioridad de roles de más específico a más general
  if (roleNames.includes("PLATFORM_ADMIN")) return "/admin";
  if (roleNames.includes("CHAIN_ADMIN")) return "/cadena";
  if (roleNames.includes("ZONE_MANAGER")) return "/zona";
  if (roleNames.includes("COCINA")) return "/cocina";
  if (roleNames.includes("BARRA")) return "/barra";
  if (roleNames.some((r) => ["ADMIN", "MESERO", "RESTAURANT_ADMIN"].includes(r))) {
    return "/mesero";
  }
  // Fallback: cualquier rol de restaurante
  return "/dashboard";
}

export async function POST(req: Request) {
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
        where: { role: { isActive: true } },
        include: { role: { select: { name: true, scope: true } } },
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

  if (user.userRoles.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Usuario sin roles asignados." },
      { status: 403 }
    );
  }

  const roleNames = user.userRoles.map((ur) => ur.role.name);
  const redirectPath = resolveRedirectPath(roleNames);

  const token = await createSessionToken(secret, 24 * 60 * 60 * 1000, {
    appUserId: user.id,
    roles: roleNames,
  });

  const res = NextResponse.json({ ok: true, redirect: redirectPath });
  res.cookies.set(sessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 24 * 60 * 60,
  });

  return res;
}
