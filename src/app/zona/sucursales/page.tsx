import ZoneBranchesConsole from "@/components/chain/ZoneBranchesConsole";

export const metadata = {
  title: "Sucursales de Zona | Bouquet",
  description: "Consola de sucursales y desempeño operativo dentro de la zona.",
};

export const dynamic = "force-dynamic";

export default async function ZonaSucursalesPage({
  searchParams,
}: {
  searchParams: Promise<{ zoneId?: string }>;
}) {
  const params = await searchParams;
  return <ZoneBranchesConsole initialZoneId={params.zoneId} />;
}

