import ChainDashboard from "@/components/chain/ChainDashboard";
import { ShellChromeProvider } from "@/components/dashboard/ShellChromeContext";

export const metadata = {
  title: "Cadena | Bouquet",
  description: "Panel de control de cadena — Bouquet.",
};

export const dynamic = "force-dynamic";

export default async function ChainPage({
  searchParams,
}: {
  searchParams: Promise<{ tenantId?: string }>;
}) {
  const { tenantId } = await searchParams;
  return (
    <ShellChromeProvider>
      <ChainDashboard tenantId={tenantId ?? ""} />
    </ShellChromeProvider>
  );
}
