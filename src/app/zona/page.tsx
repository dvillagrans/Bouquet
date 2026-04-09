import ZoneDashboard from "@/components/chain/ZoneDashboard";

export const metadata = {
  title: "Panel de Zona | Bouquet",
  description: "Vista consolidada de la zona",
};

export const dynamic = "force-dynamic";

export default function ZonaPage() {
  return <ZoneDashboard />;
}
