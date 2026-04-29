import { GuestScanQrGate } from "@/components/guest/GuestScanQrGate";
import { TableAccessScreen } from "@/components/guest/TableAccessScreen";
import { consumeTableJoinProofQuery } from "@/lib/consume-table-join-proof";
import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { hasTableJoinGate } from "@/lib/guest-table-access";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type TablePageProps = {
  params: Promise<{
    codigo: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TableAccessPage({ params, searchParams }: TablePageProps) {
  const { codigo } = await params;
  const sp = await searchParams;
  const decodedCode = decodeURIComponent(codigo);

  consumeTableJoinProofQuery(decodedCode, sp, `/mesa/${encodeURIComponent(decodedCode)}/`);

  const tableResolved = await findTableByQrCode(decodedCode);
  const canonicalQr = tableResolved?.publicCode ?? decodedCode;

  // Cookies se guardan con el código QR canónico de BD; también probamos la variante de la URL)
  const cookieStore = await cookies();
  const sessionId =
    cookieStore.get(`bq_session_${canonicalQr}`)?.value ??
    cookieStore.get(`bq_session_${decodedCode}`)?.value;
  const guestNameCookie =
    cookieStore.get(`bq_guest_${canonicalQr}`)?.value ??
    cookieStore.get(`bq_guest_${decodedCode}`)?.value;

  if (sessionId && guestNameCookie) {
    const activeSession = await prisma.diningSession.findUnique({
      where: { id: sessionId },
      select: { isActive: true, pax: true }
    });

    if (activeSession?.isActive) {
      redirect(`/mesa/${encodeURIComponent(canonicalQr)}/menu`);
    }
  }

  const existingSessionForTable = tableResolved
    ? await prisma.diningSession.findFirst({
        where: { tableId: tableResolved.id, isActive: true },
        select: { pax: true },
      })
    : null;

  if (!tableResolved) {
    return (
      <TableAccessScreen
        tableCode={decodedCode}
        isLikelyValid={false}
        existingPax={existingSessionForTable?.pax}
        requiresJoinCode={!!existingSessionForTable}
      />
    );
  }

  const gateOk = await hasTableJoinGate(tableResolved.qrCode, decodedCode);
  if (!gateOk) {
    return <GuestScanQrGate tableNumber={tableResolved.number} />;
  }

  return (
    <TableAccessScreen
      tableCode={decodedCode}
      isLikelyValid={tableResolved.status !== "SUCIA"}
      existingPax={existingSessionForTable?.pax}
      requiresJoinCode={!!existingSessionForTable}
    />
  );
}

export async function generateMetadata({ params }: TablePageProps): Promise<Metadata> {
  const { codigo } = await params;

  return {
    title: `Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "Acceso a la mesa virtual de Bouquet para continuar al menú.",
  };
}
