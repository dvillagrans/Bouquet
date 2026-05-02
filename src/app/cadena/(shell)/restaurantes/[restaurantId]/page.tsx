import ChainRestaurantDossier from "@/components/chain/ChainRestaurantDossier";

export const metadata = {
  title: "Sucursal | Bouquet",
  description: "Dossier operativo de sucursal dentro de la cadena.",
};

export const dynamic = "force-dynamic";

export default async function ChainRestaurantPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  return <ChainRestaurantDossier restaurantId={restaurantId} />;
}

