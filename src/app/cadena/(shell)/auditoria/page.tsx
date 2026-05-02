import ChainAuditSentinel from "@/components/chain/ChainAuditSentinel";

export const metadata = {
  title: "Auditoría | Bouquet",
  description: "Centro de mando para consistencia operativa de cadena (plantillas, overrides, staff y estructura).",
};

export const dynamic = "force-dynamic";

export default async function CadenaAuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const params = await searchParams;
  return <ChainAuditSentinel initialTenantId={params.tenantId} />;
}

