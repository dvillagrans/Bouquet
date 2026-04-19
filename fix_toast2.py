import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Add the Toast markup somewhere in the main render, after {/* ── TOASTS
render_target_old = r'''      {/\* ── TOASTS ───────────────────────────────────────────────────── \*/}
      <AnimatePresence>'''

render_target_new = r'''      {/* ── TOASTS ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-8 z-[100] flex justify-center px-4"
            role={toast.type === "error" ? "alert" : "status"}
            aria-live={toast.type === "error" ? "assertive" : "polite"}
          >
            <div
              className={`flex items-center gap-3 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-full border ${
                toast.type === "error"
                  ? "border-red-500/40 bg-white/95 text-red-600"
                  : "border-border-main bg-bg-panel text-text-primary"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  toast.type === "error" ? "bg-red-500 animate-pulse" : "bg-[var(--guest-accent,#997a3d)]"
                }`}
                aria-hidden="true"
              />
              <p className="text-[0.65rem] font-bold uppercase tracking-widest">{toast.message}</p>
            </div>
          </motion.div>
        )}'''

text = re.sub(render_target_old, render_target_new, text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
