import { TableAccessScreen } from "@/components/guest/TableAccessScreen";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

type TablePageProps = {
  params: Promise<{
    codigo: string;
  }>;
};

export default async function TableAccessPage({ params }: TablePageProps) {
  const { codigo } = await params;
  const decodedCode = decodeURIComponent(codigo);

  const table = await prisma.table.findUnique({
    where: { qrCode: decodedCode }
  });

  return <TableAccessScreen tableCode={decodedCode} isLikelyValid={!!table} tableNumber={table?.number} />;
}

export async function generateMetadata({ params }: TablePageProps): Promise<Metadata> {
  const { codigo } = await params;

  return {
    title: `Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "Acceso a la mesa virtual de Bouquet para continuar al menú.",
  };
}
