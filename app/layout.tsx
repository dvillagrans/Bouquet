import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  title: "Buquet - Divide. Paga. Disfruta.",
  description: "Progressive Web App para dividir cuentas en restaurantes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Buquet",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <TooltipProvider>
          <div className="min-h-screen bg-champagne">
            {children}
            <Toaster />
            <Sonner />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
