"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { GuestMenuThemeOrigin } from "@/components/guest/GuestMenuThemeToggle";
import {
  GUEST_MENU_THEME_STORAGE_KEY,
  GUEST_MENU_THEME_ATTRIBUTE,
  GUEST_MENU_THEME_COOKIE_KEY,
  type GuestMenuTheme,
} from "@/lib/guest-menu-theme";

export function useGuestMenuTheme(): {
  menuTheme: GuestMenuTheme;
  changeGuestMenuTheme: (
    next: GuestMenuTheme,
    origin?: GuestMenuThemeOrigin,
  ) => void;
} {
  /**
   * Primer render servidor y cliente deben coincidir (no leer localStorage en useState).
   * Intentamos leer el atributo aplicado por el script inyectado en el layout para evitar flashes.
   */
  const [menuTheme, setMenuTheme] = useState<GuestMenuTheme>("light");
  const skipFirstPersist = useRef(true);

  useEffect(() => {
    try {
      // 1. Ver si el script del layout ya aplicó un tema
      const attr = document.documentElement.getAttribute(GUEST_MENU_THEME_ATTRIBUTE);
      if (attr === "dark" || attr === "light") {
        setMenuTheme(attr as GuestMenuTheme);
        return;
      }

      // 2. Si no, fallback a localStorage
      const v = localStorage.getItem(GUEST_MENU_THEME_STORAGE_KEY);
      if (v === "dark" || v === "light") {
        startTransition(() => {
          setMenuTheme(v);
          document.documentElement.setAttribute(GUEST_MENU_THEME_ATTRIBUTE, v);
        });
      }
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    try {
      localStorage.setItem(GUEST_MENU_THEME_STORAGE_KEY, menuTheme);
      document.cookie = `${GUEST_MENU_THEME_COOKIE_KEY}=${menuTheme}; path=/; max-age=31536000; samesite=lax`;
      // Mantener atributo en sincronía para variables CSS globales
      document.documentElement.setAttribute(GUEST_MENU_THEME_ATTRIBUTE, menuTheme);
    } catch {
      /* noop */
    }
  }, [menuTheme]);

  /**
   * View Transitions API — círculo desde el clic (`globals.css`: `.guest-menu-vt-root`).
   */
  const changeGuestMenuTheme = useCallback(
    (next: GuestMenuTheme, origin?: GuestMenuThemeOrigin) => {
      if (typeof window !== "undefined" && origin) {
        const px = (origin.clientX / window.innerWidth) * 100;
        const py = (origin.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty("--guest-vt-x", `${px}%`);
        document.documentElement.style.setProperty("--guest-vt-y", `${py}%`);
      }

      const apply = () => {
        flushSync(() => {
          setMenuTheme(next);
        });
      };

      if (typeof document === "undefined") {
        apply();
        return;
      }

      const doc = document as Document & {
        startViewTransition?: (cb: () => void | Promise<void>) => {
          finished?: Promise<void>;
        };
      };

      try {
        if (typeof doc.startViewTransition === "function") {
          doc.startViewTransition(apply);
        } else {
          apply();
        }
      } catch {
        setMenuTheme(next);
      }
    },
    [],
  );

  return { menuTheme, changeGuestMenuTheme };
}

