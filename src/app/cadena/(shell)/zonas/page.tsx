import ChainZonesAtlas from "@/components/chain/ChainZonesAtlas";

export const metadata = {
  title: "Atlas de zonas | Bouquet",
  description: "Cartografía operativa de territorios y sucursales de la cadena.",
};

export const dynamic = "force-dynamic";

export default async function CadenaZonasPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const params = await searchParams;
  return <ChainZonesAtlas initialTenantId={params.tenantId} />;
}
