import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Remove sticky header
sticky_header_regex = r'''      \{\/\* ── Solo pipeline cocina sticky cuando hay pedidos \(sin segunda barra de acciones\) ─ \*/\}
      <AnimatePresence>
        \{orders\.length > 0 && \(
          <motion\.header
            key="guest-pipeline-sticky"
            initial=\{\{ opacity: 0, height: 0 \}\}
            animate=\{\{ opacity: 1, height: "auto" \}\}
            exit=\{\{ opacity: 0, height: 0 \}\}
            className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur-md guest-dark:border-wire/80 guest-dark:bg-panel/92 guest-dark:shadow-black/40"
          >
            <CookingPipelineBar
              pending=\{orderCounts\.PENDING\}
              preparing=\{orderCounts\.PREPARING\}
              ready=\{orderCounts\.READY\}
            />
          </motion\.header>
        \)\}
      </AnimatePresence>'''

text = re.sub(sticky_header_regex, '', text)

# 2. Place it right below the Table section (and host button)
host_section_regex = r'''            \{\/\* Anfitrión\: un solo botón\; elige compañero en el diálogo \*/}
            \{isHostLive &&
              guests\.filter\(\(g\) \=\> g\.name \!\=\= guestName\)\.length \> 0 &&
              \!\billRequested && \(
                <div className\="mt\-5"\>
                  <button
                    type\="button"
                    onClick\=\{\(\) \=\> setHostTransferDialogOpen\(true\)\}
                    className\="flex items\-center gap\-2 text\-\[0\.65rem\] font\-medium text\-slate\-500 transition\-colors hover\:text\-gold guest\-dark\:text\-dim guest\-dark\:hover\:text\-gold\/60"
                  \>
                    \<Crown className\="h\-3\.5 w\-3\.5 shrink\-0" aria\-hidden \/\>
                    Transferir rol de Anfitrión
                  \<\/button\>
                \<\/div\>
              \)\}'''

replacement = r'''            {/* Anfitrión: un solo botón; elige compañero en el diálogo */}
            {isHostLive &&
              guests.filter((g) => g.name !== guestName).length > 0 &&
              !billRequested && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setHostTransferDialogOpen(true)}
                    className="flex items-center gap-2 text-[0.65rem] font-medium text-slate-500 transition-colors hover:text-gold guest-dark:text-dim guest-dark:hover:text-gold/60"
                  >
                    <Crown className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Transferir rol de Anfitrión
                  </button>
                </div>
              )}

            <CookingPipelineBar
              pending={orderCounts.PENDING}
              preparing={orderCounts.PREPARING}
              ready={orderCounts.READY}
            />'''

text = re.sub(host_section_regex, replacement, text)

# 3. Rewrite CookingPipelineBar Component definition
old_bar = r'''function CookingPipelineBar\(\{
  pending,
  preparing,
  ready,
\}\: \{
  pending\: number;
  preparing\: number;
  ready\: number;
\}\) \{(?:.|\n)*?    \<\/div\>
  \);
\}'''

new_bar_def = r'''function CookingPipelineBar({
  pending,
  preparing,
  ready,
}: {
  pending: number;
  preparing: number;
  ready: number;
}) {
  if (pending + preparing + ready === 0) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-none border border-border-main bg-bg-solid px-5 py-4 shadow-sm">
      <span className="text-[0.7rem] uppercase tracking-widest font-medium text-text-muted whitespace-nowrap">
        Estado de órdenes:
      </span>
      <div className="flex flex-wrap items-center gap-5">
        {pending > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span className="text-[0.65rem] font-medium text-text-muted uppercase tracking-wider">{pending} Pendiente{pending !== 1 && 's'}</span>
          </div>
        )}
        {preparing > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span className="text-[0.65rem] font-medium text-text-muted uppercase tracking-wider">{preparing} Preparando</span>
          </div>
        )}
        {ready > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(202,138,4,0.3)]"></span>
            <span className="text-[0.65rem] font-bold text-text-primary uppercase tracking-wider">{ready} Listo{ready !== 1 && 's'}</span>
          </div>
        )}
      </div>
    </div>
  );
}'''

text = re.sub(old_bar, new_bar_def, text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
