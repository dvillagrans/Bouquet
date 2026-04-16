import ChainMenuTemplatesAtelier from "@/components/chain/ChainMenuTemplatesAtelier";

export const metadata = {
  title: "Plantillas de menú | Bouquet",
  description: "Biblioteca corporativa de cartas y plantillas para la cadena.",
};

export const dynamic = "force-dynamic";

export default async function CadenaPlantillasPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const params = await searchParams;
  return <ChainMenuTemplatesAtelier initialTenantId={params.tenantId} />;
}
