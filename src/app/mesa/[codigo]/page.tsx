import { TableAccessScreen } from "@/components/guest/TableAccessScreen";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type TablePageProps = {
  params: Promise<{
    codigo: string;
  }>;
};

export default async function TableAccessPage({ params }: TablePageProps) {
  const { codigo } = await params;
  const decodedCode = decodeURIComponent(codigo);

  // Check if they already have an active session for this table
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(`bq_session_${decodedCode}`)?.value;
  const guestName = cookieStore.get(`bq_guest_${decodedCode}`)?.value;

  if (sessionId && guestName) {
    const activeSession = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { isActive: true, pax: true }
    });

    if (activeSession?.isActive) {
      // Direct pass
      const query = new URLSearchParams({
        guest: guestName,
        pax: String(activeSession.pax),
        from: "qr",
      });
      redirect(`/mesa/${encodeURIComponent(decodedCode)}/menu?${query.toString()}`);
    }
  }

  // Revisamos si la mesa YA tiene una sesion activa
  const existingSessionForTable = await prisma.session.findFirst({
    where: { 
      table: { qrCode: decodedCode }, 
      isActive: true 
    },
    select: { pax: true }
  });

  const table = await prisma.table.findUnique({
    where: { qrCode: decodedCode }
  });

  return <TableAccessScreen tableCode={decodedCode} isLikelyValid={!!table && table.status !== "SUCIA"} tableNumber={table?.number} existingPax={existingSessionForTable?.pax} requiresJoinCode={!!existingSessionForTable} />;
}

export async function generateMetadata({ params }: TablePageProps): Promise<Metadata> {
  const { codigo } = await params;

  return {
    title: `Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "Acceso a la mesa virtual de Bouquet para continuar al menú.",
  };
}
