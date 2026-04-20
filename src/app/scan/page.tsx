import type { Metadata } from "next";

import { GuestScanQrGate } from "@/components/guest/GuestScanQrGate";

export const metadata: Metadata = {
  title: "Escanea tu QR · Bouquet",
  description: "Acceso para comensales mediante QR de mesa.",
};

export default function ScanPage() {
  return <GuestScanQrGate />;
}
