import { TableAccessScreen } from "@/components/guest/TableAccessScreen";
import type { Metadata } from "next";

type TablePageProps = {
  params: Promise<{
    codigo: string;
  }>;
};

function looksLikeTableCode(rawCode: string) {
  const code = rawCode.trim();

  // Accepts common QR table formats like MESA-12A, TBL7, QR-MESA-001.
  return /^[A-Za-z0-9_-]{4,32}$/.test(code);
}

export default async function TableAccessPage({ params }: TablePageProps) {
  const { codigo } = await params;
  const decodedCode = decodeURIComponent(codigo);
  const isLikelyValid = looksLikeTableCode(decodedCode);

  return <TableAccessScreen tableCode={decodedCode} isLikelyValid={isLikelyValid} />;
}

export async function generateMetadata({ params }: TablePageProps): Promise<Metadata> {
  const { codigo } = await params;

  return {
    title: `Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "Acceso a la mesa virtual de Bouquet para continuar al menú.",
  };
}
