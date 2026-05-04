import { verifySessionToken, isTokenBlacklisted, refreshSessionToken, sessionCookieName } from "@/lib/auth-session";
import { resolveTenantScope } from "@/lib/tenant";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AuthContext = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  restaurantId?: string;
  zoneId?: string;
  chainId?: string;
};

export type WithAuthOptions = {
  permission?: string;
  allowRoles?: string[];
  requireTenant?: boolean;
};

export function withAuth<TArgs extends any[], TReturn>(
  fn: (ctx: AuthContext, ...args: TArgs) => Promise<TReturn>,
  opts: WithAuthOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const cookieStore = await cookies();
    const token = cookieStore.get(sessionCookieName())?.value;
    console.log("[withAuth] cookie name:", sessionCookieName(), "token found:", !!token);
    if (!token) redirect("/login");

    if (isTokenBlacklisted(token)) redirect("/login");

    const session = await verifySessionToken(token);
    if (!session.ok) redirect("/login");

    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.appUser.findUnique({
      where: { id: session.appUserId },
      include: {
        userRoles: {
          include: {
            role: { include: { permissions: { include: { permission: true } } } },
          },
        },
      },
    });
    if (!user) redirect("/login");

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.permissions.map((rp) => rp.permission.code)
    );

    if (opts.permission && !permissions.includes(opts.permission)) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("Forbidden: missing permission " + opts.permission);
      }
      console.warn(`[auth] Missing permission "${opts.permission}" for user ${user.email} — allowing in dev`);
    }
    if (opts.allowRoles && !roles.some((r) => opts.allowRoles!.includes(r))) {
      throw new Error("Forbidden: role not allowed");
    }

    const tenant = await resolveTenantScope(user.id);
    if (opts.requireTenant && !tenant.restaurantId && !tenant.chainId) {
      throw new Error("Forbidden: no tenant context");
    }

    // Sliding TTL
    let newToken: string | undefined;
    try {
      newToken = await refreshSessionToken(token);
    } catch {}
    if (newToken) {
      cookieStore.set(sessionCookieName(), newToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    const ctx: AuthContext = {
      userId: user.id,
      email: user.email,
      roles,
      permissions,
      ...tenant,
    };
    return fn(ctx, ...args);
  };
}
