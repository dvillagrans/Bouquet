"use client";

import * as React from "react";

type ShellChromeContextValue = {
  hideDashboardChrome: boolean;
  setHideDashboardChrome: React.Dispatch<React.SetStateAction<boolean>>;
};

const ShellChromeContext = React.createContext<ShellChromeContextValue | null>(null);

export function ShellChromeProvider({ children }: { children: React.ReactNode }) {
  const [hideDashboardChrome, setHideDashboardChrome] = React.useState(false);
  const value = React.useMemo(
    () => ({ hideDashboardChrome, setHideDashboardChrome }),
    [hideDashboardChrome],
  );
  return <ShellChromeContext.Provider value={value}>{children}</ShellChromeContext.Provider>;
}

export function useShellChrome() {
  const ctx = React.useContext(ShellChromeContext);
  if (!ctx) {
    throw new Error("useShellChrome must be used within ShellChromeProvider");
  }
  return ctx;
}
