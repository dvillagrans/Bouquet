import ZoneStaffPanel from "@/components/chain/ZoneStaffPanel";

export const metadata = {
  title: "Personal Zonal | Bouquet",
  description: "Gestión de staff y accesos por PIN para operaciones de zona.",
};

export const dynamic = "force-dynamic";

export default async function ZonaStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ zoneId?: string }>;
}) {
  const params = await searchParams;
  return <ZoneStaffPanel initialZoneId={params.zoneId} />;
}

