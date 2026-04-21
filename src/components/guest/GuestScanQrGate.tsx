type GuestScanQrGateProps = {
  tableNumber?: number;
};

export function GuestScanQrGate({ tableNumber }: GuestScanQrGateProps) {
  const label =
    typeof tableNumber === "number" ? `Mesa ${tableNumber}` : "Esta mesa";

  return (
    <main
      className="guest-menu-vt-root relative isolate min-h-screen overflow-hidden bg-cream px-5 py-10 guest-dark:bg-[var(--guest-bg-page,#0c0907)] sm:px-8 sm:py-14"
      aria-labelledby="guest-qr-gate-title"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-45 mix-blend-multiply guest-dark:mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 16% 18%, rgba(183,146,93,0.18), transparent 36%), radial-gradient(circle at 84% 80%, rgba(110,139,106,0.22), transparent 40%), linear-gradient(145deg, rgba(255,255,255,0.55), rgba(255,255,255,0))",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-3xl items-center justify-center pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <section className="w-full rounded-[2rem] border border-black/10 bg-white/[0.82] p-6 shadow-[0_20px_70px_-28px_rgba(43,36,30,0.45)] backdrop-blur-xl guest-dark:border-white/10 guest-dark:bg-white/[0.05] sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/85 px-3 py-1.5 text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-charcoal-light guest-dark:border-white/15 guest-dark:bg-white/[0.04] guest-dark:text-[var(--guest-text-muted,#9A9083)]">
            <span className="h-1.5 w-1.5 rounded-full bg-gold guest-status-dot-pulse" aria-hidden="true" />
            Entrada protegida
          </div>

          <div className="grid gap-8 sm:gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h1
                id="guest-qr-gate-title"
                className="font-sans text-[clamp(1.75rem,4.6vw,2.55rem)] font-semibold leading-[1.05] tracking-tight text-[#1a1612] guest-dark:text-[var(--guest-text-primary,#EDE8E1)]"
              >
                Acceso con QR
                <span className="mt-1 block font-serif text-[0.58em] font-medium tracking-[0.08em] text-gold">
                  para {label}
                </span>
              </h1>

              <p className="mt-5 text-[1rem] leading-relaxed text-[#4a453c] guest-dark:text-[var(--guest-text-muted,#9A9083)] sm:text-[1.03rem]">
                Para unirte, escanea el código físico colocado en la mesa. Si no lo tienes a la mano,
                solicita al personal el enlace firmado desde el panel operativo.
              </p>

              <div className="mt-5 space-y-2 text-[0.9rem] leading-relaxed text-[#615a50] guest-dark:text-dim">
                <p>El enlace corto por sí solo ya no autoriza el acceso.</p>
                <p>Esta medida evita ingresos no autorizados a la sesión activa.</p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[14.5rem] sm:max-w-[15.5rem]">
              <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_50%_50%,rgba(183,146,93,0.28),transparent_70%)] blur-xl" aria-hidden="true" />
              <div className="relative rounded-[1.75rem] border border-black/10 bg-[#fffdfa] p-5 shadow-[0_10px_30px_-18px_rgba(43,36,30,0.55)] guest-dark:border-white/12 guest-dark:bg-[#17120d]">
                <div className="mb-4 text-center text-[0.64rem] font-semibold uppercase tracking-[0.19em] text-[#746a5d] guest-dark:text-[#a89984]">
                  Escanear para continuar
                </div>

                <div className="mx-auto grid aspect-square w-full grid-cols-7 gap-1 rounded-xl border border-black/10 bg-white p-2 guest-dark:border-white/10 guest-dark:bg-[#0f0b08]">
                  {Array.from({ length: 49 }).map((_, i) => {
                    const filled =
                      i % 3 === 0 ||
                      i % 7 === 0 ||
                      i === 1 ||
                      i === 8 ||
                      i === 40 ||
                      i === 47 ||
                      i === 24;
                    return (
                      <span
                        key={i}
                        className={filled ? "rounded-[2px] bg-[#1f1a15] guest-dark:bg-[#f0e4d4]" : "rounded-[2px] bg-transparent"}
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>

                <p className="mt-4 text-center text-[0.73rem] leading-relaxed text-[#6f6659] guest-dark:text-[#9f927f]">
                  Usa la cámara del teléfono directo sobre el QR de tu mesa.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
