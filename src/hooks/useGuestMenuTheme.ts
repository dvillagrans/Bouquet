"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { GuestMenuThemeOrigin } from "@/components/guest/GuestMenuThemeToggle";
import {
  GUEST_MENU_THEME_STORAGE_KEY,
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
   * La preferencia guardada se aplica tras montar para evitar errores de hidratación.
   */
  const [menuTheme, setMenuTheme] = useState<GuestMenuTheme>("light");
  const skipFirstPersist = useRef(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(GUEST_MENU_THEME_STORAGE_KEY);
      if (v === "dark" || v === "light") {
        startTransition(() => setMenuTheme(v));
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
    } catch {
      /* noop */
    }
  }, [menuTheme]);

  /**
   * View Transitions API — círculo desde el clic (`globals.css`: `.guest-menu-vt-root`).
   * El callback de `startViewTransition` debe actualizar el DOM antes de salir; `flushSync`
   * fuerza el commit de React en ese fotograma. Si VT falla, aplicamos tema igual.
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
