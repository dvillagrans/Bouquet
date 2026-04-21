import { GUEST_MENU_THEME_STORAGE_KEY, GUEST_MENU_THEME_ATTRIBUTE } from "@/lib/guest-menu-theme";

export default function GuestMesaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /**
   * Este script se inyecta en el <head> y se ejecuta ANTES de que el body se pinte.
   * Lee la preferencia guardada en localStorage y aplica el atributo al tag <html>,
   * permitiendo que las variables CSS [data-guest-theme] se activen instantáneamente.
   */
  const blockingThemeScript = `
    (function() {
      try {
        var theme = localStorage.getItem("${GUEST_MENU_THEME_STORAGE_KEY}");
        if (theme === "dark" || theme === "light") {
          document.documentElement.setAttribute("${GUEST_MENU_THEME_ATTRIBUTE}", theme);
        }
      } catch (e) {}
    })();
  `;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: blockingThemeScript }}
      />
      {children}
    </>
  );
}
