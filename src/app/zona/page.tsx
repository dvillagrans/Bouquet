import ZoneDashboard from "@/components/chain/ZoneDashboard";
import { getCurrentUser } from "@/lib/auth-server";

export const metadata = {
  title: "Panel de Zona | Bouquet",
  description: "Vista consolidada de la zona",
};

export const dynamic = "force-dynamic";

export default async function ZonaPage({ searchParams }: { searchParams: Promise<{ zoneId?: string }> }) {
  const params = await searchParams;

  // If no zoneId in URL, resolve from the user's zone assignments
  let resolvedZoneId = params.zoneId;
  if (!resolvedZoneId) {
    const user = await getCurrentUser();
    if (user && user.zoneIds.length > 0) {
      resolvedZoneId = user.zoneIds[0];
    }
  }

  return <ZoneDashboard initialZoneId={resolvedZoneId} />;
}
