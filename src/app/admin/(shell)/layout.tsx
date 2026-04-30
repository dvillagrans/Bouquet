import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  sessionCookieName,
  resolveAuthSecret,
  verifySessionToken,
} from "@/lib/auth-session";
import { prisma } from "@/lib/prisma";
import AdminShellClient from "./AdminShellClient";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const secret = resolveAuthSecret();
  if (!secret) {
    redirect("/login?error=missing_secret");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  const session = await verifySessionToken(token, secret);
  if (!session.ok) {
    const h = await headers();
    const from = h.get("x-bouquet-admin-pathname") ?? "/admin";
    redirect(`/login?from=${encodeURIComponent(from)}`);
  }

  // Validar que tenga rol PLATFORM
  if (!session.roles.includes("PLATFORM_ADMIN")) {
    redirect("/login?error=unauthorized");
  }

  const user = await prisma.appUser.findUnique({
    where: { id: session.appUserId },
    select: { firstName: true, lastName: true },
  });

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Admin";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AdminShellClient userName={userName} userInitial={userInitial}>
      {children}
    </AdminShellClient>
  );
}
