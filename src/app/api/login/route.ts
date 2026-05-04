import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth-password";
import {
  createSessionToken,
  resolveAuthSecret,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/auth-session";
import { rateLimit } from "@/lib/rate-limit";
import { createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set — skipping CAPTCHA verification");
    return true; // Allow in dev without key
  }
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token }),
  });
  const data = await res.json() as { success?: boolean };
  return data.success === true;
}

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
  try {
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

  let body: { email?: string; password?: string; turnstileToken?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string; turnstileToken?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const turnstileToken = body.turnstileToken;

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Faltan credenciales." }, { status: 400 });
  }

  if (!turnstileToken || !(await verifyTurnstile(turnstileToken))) {
    return NextResponse.json(
      { ok: false, error: "Verificación de seguridad fallida. Intenta de nuevo." },
      { status: 400 }
    );
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

  // Password policy: warn only, never block existing users
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

  createAuditLog({
    actorUserId: user.id,
    action: "LOGIN",
    entityType: "AppUser",
    entityId: user.id,
    ipAddress: requestIp,
  });

  const res = NextResponse.json({ ok: true, redirect: redirectPath });
  res.cookies.set(sessionCookieName(), token, {
    ...sessionCookieOptions(req),
    maxAge: 24 * 60 * 60,
  });

  return res;
  } catch (err) {
    console.error("[/api/login] Unhandled error:", err);
    return NextResponse.json(
      { ok: false, error: process.env.NODE_ENV === "production" ? "Error interno del servidor." : `Error interno: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
