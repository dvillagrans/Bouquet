import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

old_block = r'''              <button
                type="button"
                onClick={() => setQrInviteFullscreenOpen(true)}
                className="inline-flex items-center gap-2 text-\[0\.7rem\] font-medium text-text-muted transition-colors hover:text-text-primary"
                aria-haspopup="dialog"
                aria-expanded={qrInviteFullscreenOpen}
                aria-label="Abrir código QR para compartir la mesa"
              >
                <Share2 className="h-3\.5 w-3\.5" aria-hidden />
                Compartir
              </button>
            </section>

            {/\* Anfitrión: un solo botón; elige compañero en el diálogo \*/}
            {isHostLive &&
              guests\.filter\(\(g\) => g\.name !== guestName\)\.length > 0 &&
              !billRequested && \(
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={\(\) => setHostTransferDialogOpen\(true\)}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-amber-800/25 bg-white/90 px-4 py-3 text-\[0\.72rem\] font-bold uppercase tracking-\[0\.16em\] text-amber-950 shadow-sm transition-colors hover:bg-amber-50 sm:w-auto guest-dark:border-amber-400/30 guest-dark:bg-panel guest-dark:text-amber-50 guest-dark:hover:bg-panel/85"
                    aria-haspopup="dialog"
                    aria-expanded={hostTransferDialogOpen}
                  >
                    Pasar anfitrión
                  </button>
                </div>
              \)}'''

new_block = r'''              <div className="mt-2 flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setQrInviteFullscreenOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-text-muted transition-colors hover:text-text-primary"
                  aria-haspopup="dialog"
                  aria-expanded={qrInviteFullscreenOpen}
                  aria-label="Abrir código QR para compartir la mesa"
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  Compartir enlace
                </button>

                {/* Anfitrión: un solo botón; elige compañero en el diálogo */}
                {isHostLive &&
                  guests.filter((g) => g.name !== guestName).length > 0 &&
                  !billRequested && (
                    <button
                      type="button"
                      onClick={() => setHostTransferDialogOpen(true)}
                      className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-text-muted transition-colors hover:text-[var(--guest-accent,#997a3d)]"
                      aria-haspopup="dialog"
                      aria-expanded={hostTransferDialogOpen}
                    >
                      Pasar anfitrión
                    </button>
                  )}
              </div>
            </section>'''

text = re.sub(old_block, new_block, text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)

