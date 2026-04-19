"use client";

import { useLayoutEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  APP_THEME_STORAGE_KEY,
  themePreferenceCookieHeader,
  type AppThemePreference,
} from "@/lib/theme-storage";

/**
 * Sin `<script>` en React: el HTML inicial lleva tema desde cookie en el servidor.
 * Esto solo alinea localStorage legacy + cookie cuando el usuario ya tenía preferencia guardada.
 */
export function ThemePreferenceSync() {
  const router = useRouter();
  const ran = useRef(false);

  useLayoutEffect(() => {
    if (ran.current) return;
    ran.current = true;

    try {
      const stored = localStorage.getItem(APP_THEME_STORAGE_KEY) as AppThemePreference | null;
      if (stored !== "light" && stored !== "dark") return;

      const root = document.documentElement;
      const serverHadDark = root.classList.contains("dark");
      const wantDark = stored === "dark";

      if (wantDark === serverHadDark) {
        document.cookie = themePreferenceCookieHeader(stored);
        return;
      }

      if (stored === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      document.cookie = themePreferenceCookieHeader(stored);
      router.refresh();
    } catch {
      /* ignore */
    }
  }, [router]);

  return null;
}
