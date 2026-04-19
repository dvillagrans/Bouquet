"use client";

import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  APP_THEME_STORAGE_KEY,
  themePreferenceCookieHeader,
  type AppThemePreference,
} from "@/lib/theme-storage";
import { cn } from "@/lib/utils";

function readIsDark(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

function applyTheme(mode: AppThemePreference) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem(APP_THEME_STORAGE_KEY, mode);
  document.cookie = themePreferenceCookieHeader(mode);
}

type ThemeToggleProps = {
  className?: string;
};

/** Alterna tema claro/oscuro global (clase `.dark` en `<html>`). */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
      setDark(readIsDark());
    });
  }, []);

  const toggle = useCallback(() => {
    const next = !readIsDark();
    applyTheme(next ? "dark" : "light");
    setDark(next);
    router.refresh();
  }, [router]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full border-border/80 bg-background/80 shadow-md backdrop-blur-md dark:border-input dark:bg-input/40",
        className,
      )}
      aria-label={dark ? "Activar tema claro" : "Activar tema oscuro"}
      aria-pressed={dark}
      onClick={toggle}
    >
      {!mounted ? (
        <Sun className="size-4 opacity-60" aria-hidden />
      ) : dark ? (
        <Sun className="size-4" aria-hidden />
      ) : (
        <Moon className="size-4" aria-hidden />
      )}
    </Button>
  );
}
