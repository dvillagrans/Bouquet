import ScannerScreen from "@/components/guest/ScannerScreen";

export const metadata = {
  title: "Escanear Mesa | Bouquet",
  description: "Escanea el código QR de tu mesa para empezar.",
};

export default function ScanPage() {
  return <ScannerScreen />;
}
