import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Fix desktop sidebar
right_panel_old = r'''          {/\* RIGHT\: Sticky order panel \(desktop only\) \*/}
          <aside className\="z\-20 hidden lg\:block lg\:self\-start lg\:sticky lg\:top\-28"\>
            <div className\="mt\-6 rounded\-3xl border border\-white\/80 bg\-white\/45 p\-8 shadow\-\[inset_0_1px_0_rgba\(255,255,255,0\.85\),0_24px_64px_rgba\(15,23,42,0\.1\)\] backdrop\-blur\-xl guest\-dark\:border\-wire\/60 guest\-dark\:bg\-panel\/70 guest\-dark\:shadow\-\[inset_0_1px_0_rgba\(255,255,255,0\.06\),0_24px_64px_rgba\(0,0,0,0\.35\)\]"\>
              <CartPanel \{\.\.\.cartPanelProps\} \/>
              \{\!billRequested && \(
                <div className\="mt\-6 border\-t border\-slate\-200\/70 pt\-4 guest\-dark\:border\-wire\/45"\>
                  <Link
                    href\=\{cuentaHref\}
                    className\="text\-\[0\.65rem\] font\-medium text\-slate\-500 transition\-colors hover\:text\-gold guest\-dark\:text\-dim guest\-dark\:hover\:text\-gold\/60"
                  \>
                    Pagar solo tu parte →
                  </Link>
                </div>
              \)\}
            </div>
          </aside>'''

right_panel_new = r'''          {/* RIGHT: Sticky order panel (desktop only) */}
          <aside className="z-20 hidden lg:block lg:self-start lg:sticky lg:top-28">
            <div className="mt-8 rounded-none border border-border-main bg-bg-solid p-6 shadow-sm">
              <CartPanel {...cartPanelProps} />
              {!billRequested && (
                <div className="mt-6 border-t border-border-main pt-4 flex justify-end">
                  <Link
                    href={cuentaHref}
                    className="text-sm font-medium text-text-primary hover:text-gold transition-colors"
                  >
                    Pagar solo tu parte →
                  </Link>
                </div>
              )}
            </div>
          </aside>'''


text = re.sub(right_panel_old, right_panel_new, text)

# Fix mobile drawer styling
mobile_drawer_old = r'''          <div
            className="absolute inset-x-0 bottom-0 border-t border-white/60 bg-white/50 px-6 pt-6 pb-\[max\(1\.5rem,env\(safe-area-inset-bottom\)\)\] shadow-\[0_-12px_40px_rgba\(15,23,42,0\.08\)\] backdrop-blur-xl guest-dark:border-wire/50 guest-dark:bg-ink/90 guest-dark:shadow-\[0_-16px_48px_rgba\(0,0,0,0\.45\)\]"
            style=\{\{ animation: "slide-from-bottom 0\.28s cubic-bezier\(0\.25,0\.46,0\.45,0\.94\) both" \}\}
          >
            <div className="mx-auto max-w-lg rounded-3xl border border-white/80 bg-white/50 p-6 shadow-\[inset_0_1px_0_rgba\(255,255,255,0\.9\)\] guest-dark:border-wire/55 guest-dark:bg-panel/80 guest-dark:shadow-\[inset_0_1px_0_rgba\(255,255,255,0\.05\)\]">
              <CartPanel \{\.\.\.cartPanelProps\} scrollable onClose=\{\(\) \=> setDrawerOpen\(false\)\} />
            </div>
          </div>'''

mobile_drawer_new = r'''          <div
            className="absolute inset-x-0 bottom-0 border-t border-border-main bg-bg-solid px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.06)]"
            style={{ animation: "slide-from-bottom 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both" }}
          >
            <div className="mx-auto max-w-lg">
              <CartPanel {...cartPanelProps} scrollable onClose={() => setDrawerOpen(false)} />
            </div>
          </div>'''

text = re.sub(mobile_drawer_old, mobile_drawer_new, text)

# Fix Tu orden header
cart_panel_header_old = r'''      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 guest-dark:text-light">Tu orden</h2>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-500 guest-dark:text-dim">
            Mesa \{tableCode\}
          </p>
        </div>
        \{onClose && \(
          <button
            onClick=\{onClose\}
            aria-label="Cerrar orden"
            className="mt-1 shrink-0 text-xs font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:text-slate-600 guest-dark:text-dim guest-dark:hover:text-light"
          >
            Cerrar
          </button>
        \)\}
      </div>

      \{cartCount === 0 \? \(
        <p className="mt-8 text-sm font-medium leading-relaxed text-slate-500 guest-dark:text-dim">
          Selecciona platillos del menú para armar tu orden.
        </p>
      \) : \('''

cart_panel_header_new = r'''      <div className="flex items-end justify-between border-b border-border-main pb-4">
        <div>
          <h2 className="text-2xl font-serif text-text-primary">Tu orden</h2>
          <p className="text-sm text-text-muted mt-1">
            Mesa {tableCode}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar orden"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
          >
            Cerrar
          </button>
        )}
      </div>

      {cartCount === 0 ? (
        <p className="mt-8 text-sm text-text-muted italic">
          Selecciona platillos del menú para agregarlos a tu orden.
        </p>
      ) : ('''

text = re.sub(cart_panel_header_old, cart_panel_header_new, text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
