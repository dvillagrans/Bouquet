import type { Metadata } from "next";
import { Space_Mono, DM_Sans, Playfair_Display } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ReactGrabDevLoader } from "@/components/dev/ReactGrabDevLoader";
import { ThemePreferenceSync } from "@/components/theme/theme-preference-sync";
import { GUEST_MENU_THEME_ATTRIBUTE, GUEST_MENU_THEME_COOKIE_KEY } from "@/lib/guest-menu-theme";
import { APP_THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { cn } from "@/lib/utils";

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600"],
  style: ["normal", "italic"],
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
  const guestThemeCookie = cookieStore.get(GUEST_MENU_THEME_COOKIE_KEY)?.value;
  const guestTheme = guestThemeCookie === "dark" ? "dark" : "light";

  return (
    <html
      lang="es"
      suppressHydrationWarning
      {...{ [GUEST_MENU_THEME_ATTRIBUTE]: guestTheme }}
      className={cn("font-sans", dmSans.variable, spaceMono.variable, playfair.variable, !isLight && "dark")}
    >
      <body className={`${dmSans.variable} ${spaceMono.variable} ${playfair.variable} font-sans antialiased`}>
        {process.env.NODE_ENV === "development" && <ReactGrabDevLoader />}
        <ThemePreferenceSync />
        {children}
      </body>
    </html>
  );
}
