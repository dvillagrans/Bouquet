/** Persistencia solo del tema visual del menú QR (no del tema global de la app). */
export const GUEST_MENU_THEME_STORAGE_KEY = "bq-guest-menu-theme";
/** Cookie SSR para aplicar el tema desde servidor en rutas de invitado. */
export const GUEST_MENU_THEME_COOKIE_KEY = GUEST_MENU_THEME_STORAGE_KEY;
/** Atributo que usamos en el <html> para aplicar variables CSS sin flashes. */
export const GUEST_MENU_THEME_ATTRIBUTE = "data-guest-theme";

export type GuestMenuTheme = "light" | "dark";
