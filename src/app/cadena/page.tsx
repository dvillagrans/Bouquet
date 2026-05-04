import ChainDashboard from "@/components/chain/ChainDashboard";
import { ShellChromeProvider } from "@/components/dashboard/ShellChromeContext";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Cadena | Bouquet",
  description: "Panel de control de cadena — Bouquet.",
};

export const dynamic = "force-dynamic";

export default async function ChainPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { tenantId } = await searchParams;

  // If no tenantId in URL, resolve from the user's chain assignments
  let resolvedTenantId = tenantId;
  if (!resolvedTenantId) {
    const user = await getCurrentUser();
    if (user && user.chainIds.length > 0) {
      resolvedTenantId = user.chainIds[0];
    }
  }

  if (!resolvedTenantId) {
    redirect("/login?error=no_tenant");
  }

  return (
    <ShellChromeProvider>
      <ChainDashboard tenantId={resolvedTenantId} />
    </ShellChromeProvider>
  );
}
