type GuestScanQrGateProps = {
  tableNumber?: number;
};

export function GuestScanQrGate({ tableNumber }: GuestScanQrGateProps) {
  const label =
    typeof tableNumber === "number" ? `Mesa ${tableNumber}` : "Esta mesa";

  return (
    <main className="guest-menu-vt-root min-h-screen bg-cream px-6 py-16 guest-dark:bg-[var(--guest-bg-page,#0c0907)]">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 pt-[max(4rem,env(safe-area-inset-top))] text-center">
        <div className="rounded-2xl border border-black/10 bg-white/80 px-6 py-8 shadow-sm guest-dark:border-white/10 guest-dark:bg-white/[0.04]">
          <h1 className="text-xl font-semibold tracking-tight text-[#1a1612] guest-dark:text-[var(--guest-text-primary,#EDE8E1)]">
            Acceso con código QR
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-[#4a453c] guest-dark:text-[var(--guest-text-muted,#9A9083)]">
            Para unirte a <span className="font-medium text-[#1a1612] guest-dark:text-[var(--guest-text-primary,#EDE8E1)]">{label}</span>,
            escanea el código QR que está sobre la mesa o pide al personal que te muestre el enlace
            firmado desde el panel del restaurante.
          </p>
          <p className="mt-3 text-sm text-[#6f6a62] guest-dark:text-dim">
            Por seguridad, solo el código o la ruta corta ya no bastan.
          </p>
        </div>
      </div>
    </main>
  );
}
