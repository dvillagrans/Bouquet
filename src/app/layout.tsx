import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ReactGrabDevLoader } from "@/components/dev/ReactGrabDevLoader";
import { ThemePreferenceSync } from "@/components/theme/theme-preference-sync";
import { APP_THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const serif = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bouquet — Hospitality OS para restaurantes",
  description:
    "Gestiona mesas, órdenes y pagos desde una sola plataforma. Pensada para restaurantes que no aceptan el desorden.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(APP_THEME_STORAGE_KEY)?.value;
  const isLight = themeCookie === "light";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable, geistMono.variable, !isLight && "dark")}
    >
      <body className={`${serif.variable} ${sans.variable} ${geistMono.variable} font-sans antialiased`}>
        {process.env.NODE_ENV === "development" && <ReactGrabDevLoader />}
        <ThemePreferenceSync />
        {children}
      </body>
    </html>
  );
}
