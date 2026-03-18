"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-light">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
          style={{ animation: "fade-in 0.2s ease-out both" }}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-4 border-b border-wire bg-ink px-5 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={sidebarOpen}
          className="flex h-9 w-9 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
        <span className="font-serif text-[1.2rem] font-semibold italic tracking-tight text-light">
          bouquet
        </span>
        <span className="text-[0.44rem] font-bold uppercase tracking-[0.34em] text-dim">ops</span>
      </header>

      {/* Main content */}
      <main className="dash-main min-h-screen" style={{ paddingTop: "3.5rem" }}>
        <div style={{ marginLeft: "0" }} className="dash-content-offset">
          {children}
        </div>
      </main>

    </div>
  );
}
