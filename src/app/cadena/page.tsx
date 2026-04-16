import ChainDashboard from "@/components/chain/ChainDashboard";

export const metadata = {
  title: "Panel de Cadena | Bouquet",
  description: "Vista consolidada de todas las sucursales",
};

export const dynamic = "force-dynamic";

export default async function CadenaPage({ searchParams }: { searchParams: Promise<{ tenantId?: string }> }) {
  const params = await searchParams;
  return <ChainDashboard initialTenantId={params.tenantId} />;
}
