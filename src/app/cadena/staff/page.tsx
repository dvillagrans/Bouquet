import ChainStaffRoster from "@/components/chain/ChainStaffRoster";

export const metadata = {
  title: "Personal corporativo | Bouquet",
  description: "Nómina, roles y accesos PIN del equipo de cadena.",
};

export const dynamic = "force-dynamic";

export default async function CadenaStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const params = await searchParams;
  return <ChainStaffRoster initialTenantId={params.tenantId} />;
}
