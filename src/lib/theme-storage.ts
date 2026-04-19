/**
 * Preferencia global claro/oscuro. Por defecto la UI es oscura en toda la app;
 * solo se guarda `"light"` cuando el usuario activa modo claro explícitamente.
 */
export const APP_THEME_STORAGE_KEY = "bouquet-theme";

export type AppThemePreference = "light" | "dark";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Cookie legible por JS (no HttpOnly): el layout del servidor usa el valor para la clase `.dark` en `<html>`. */
export function themePreferenceCookieHeader(mode: AppThemePreference): string {
  return `${APP_THEME_STORAGE_KEY}=${mode}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax`;
}
