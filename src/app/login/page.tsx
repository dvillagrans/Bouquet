import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginPageClient from "@/components/auth/LoginPageClient";
import {
  sessionCookieName,
  resolveAuthSecret,
  verifySessionToken,
} from "@/lib/auth-session";

export const metadata = {
  title: "Iniciar sesión | Bouquet",
  description: "Acceso unificado a la plataforma Bouquet.",
};

export const dynamic = "force-dynamic";

function resolveRedirectPath(roles: string[]): string {
  if (roles.includes("PLATFORM_ADMIN")) return "/admin";
  if (roles.includes("CHAIN_ADMIN")) return "/cadena";
  if (roles.includes("ZONE_MANAGER")) return "/zona";
  if (roles.includes("COCINA")) return "/cocina";
  if (roles.includes("BARRA")) return "/barra";
  if (roles.some((r) => ["ADMIN", "MESERO", "RESTAURANT_ADMIN"].includes(r))) {
    return "/mesero";
  }
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; error?: string }>;
}) {
  const params = await searchParams;
  const secret = resolveAuthSecret();

  if (secret) {
    const token = (await cookies()).get(sessionCookieName())?.value;
    const session = await verifySessionToken(token, secret);
    if (session.ok) {
      const redirectPath = resolveRedirectPath(session.roles);
      redirect(params.from && params.from.startsWith("/") ? params.from : redirectPath);
    }
  }

  return <LoginPageClient initialError={params.error} />;
}
