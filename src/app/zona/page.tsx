import ZoneDashboard from "@/components/chain/ZoneDashboard";

export const metadata = {
  title: "Panel de Zona | Bouquet",
  description: "Vista consolidada de la zona",
};

export const dynamic = "force-dynamic";

export default async function ZonaPage({ searchParams }: { searchParams: Promise<{ zoneId?: string }> }) {
  const params = await searchParams;
  return <ZoneDashboard initialZoneId={params.zoneId} />;
}
