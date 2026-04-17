import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import {
  adminSessionCookieName,
  resolveAdminAuthSecret,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

export const metadata = {
  title: "Acceso Admin | Bouquet",
  description: "Inicia sesión en la consola BouquetOps.",
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  const secret = resolveAdminAuthSecret();
  if (secret) {
    const token = (await cookies()).get(adminSessionCookieName())?.value;
    if (await verifyAdminSessionToken(token, secret)) {
      redirect("/admin");
    }
  }
  return <AdminLoginForm initialFrom={params.from} initialError={params.error} />;
}
