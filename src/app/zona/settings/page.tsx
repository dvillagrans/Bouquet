import ZoneSettingsPanel from "@/components/chain/ZoneSettingsPanel";

export const metadata = {
  title: "Configuración de Zona | Bouquet",
  description: "Preferencias y seguridad operativa del dashboard de zona.",
};

export const dynamic = "force-dynamic";

export default async function ZonaSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ zoneId?: string }>;
}) {
  const params = await searchParams;
  return <ZoneSettingsPanel initialZoneId={params.zoneId} />;
}

