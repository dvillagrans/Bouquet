import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  adminSessionCookieName,
  resolveAdminAuthSecret,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import AdminShellClient from "./AdminShellClient";

export default async function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const secret = resolveAdminAuthSecret();
  if (!secret) {
    redirect("/admin/login?error=missing_secret");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName())?.value;
  const ok = await verifyAdminSessionToken(token, secret);
  if (!ok) {
    const h = await headers();
    const from = h.get("x-bouquet-admin-pathname") ?? "/admin";
    redirect(`/admin/login?from=${encodeURIComponent(from)}`);
  }

  return <AdminShellClient>{children}</AdminShellClient>;
}
