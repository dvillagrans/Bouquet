import ChainDashboard from "@/components/chain/ChainDashboard";

export const metadata = {
  title: "Panel de Cadena | Bouquet",
  description: "Vista consolidada de todas las sucursales",
};

export const dynamic = "force-dynamic";

export default function CadenaPage() {
  return <ChainDashboard />;
}
