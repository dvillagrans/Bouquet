"use client";

import React, { createContext, useContext, useId } from "react";
import { cn } from "@/lib/utils";

type MobileTabPillsContextValue = {
  activeValue: string;
  onChange: (value: string) => void;
  baseId: string;
};

const MobileTabPillsContext = createContext<MobileTabPillsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(MobileTabPillsContext);
  if (!ctx) throw new Error("MobileTabPills subcomponents must be used within MobileTabPills");
  return ctx;
}

/* ── Root Provider ── */
export function MobileTabPills({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const baseId = useId();
  return (
    <MobileTabPillsContext.Provider value={{ activeValue: value, onChange, baseId }}>
      {children}
    </MobileTabPillsContext.Provider>
  );
}

/* ── TabList ── */
export function MobileTabPillsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1.5 overflow-x-auto pr-4 touch-manipulation scrollbar-hide", className)}
    >
      {children}
    </div>
  );
}

/* ── Tab ── */
export function MobileTabPillsTab({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { activeValue, onChange, baseId } = useTabs();
  const active = activeValue === value;
  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      type="button"
      role="tab"
      id={tabId}
      aria-selected={active}
      aria-controls={panelId}
      onClick={() => onChange(value)}
      className={cn(
        "shrink-0 min-h-[44px] touch-manipulation rounded-full px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary/10 text-primary"
          : "text-dim hover:text-light hover:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── TabPanel ── */
export function MobileTabPillsPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { activeValue, baseId } = useTabs();
  const active = activeValue === value;
  const panelId = `${baseId}-panel-${value}`;
  const tabId = `${baseId}-tab-${value}`;

  if (!active) return null;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      className={className}
    >
      {children}
    </div>
  );
}
