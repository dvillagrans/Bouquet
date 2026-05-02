import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  sessionCookieName,
  resolveAuthSecret,
  verifySessionToken,
} from "@/lib/auth-session";
import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";

export const metadata = {
  title: "Control · Bouquet",
  description: "Consola de super-administración Bouquet — god mode.",
};

export const dynamic = "force-dynamic";

export default async function SuperAdminConsolePage() {
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

  if (!session.roles.includes("PLATFORM_ADMIN")) {
    redirect("/login?error=unauthorized");
  }

  return <SuperAdminDashboard />;
}
