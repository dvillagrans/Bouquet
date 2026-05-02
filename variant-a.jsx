// Variation A — Dashboard operativo (DARK)
// Aplica DESIGN.md v2: ink/canvas/panel/wire, glassmorphism dark, headlines serif italic
// con acento pink-glow, overlines mono, film grain, dash-* semantic tokens
const VariantA = () => {
  const revenue = useTickingNumber(124540);
  const orders = useTickingNumber(143);
  const ticket = useTickingNumber(345);

  const hourly = [4, 8, 12, 18, 22, 28, 34, 30, 26, 32, 38, 42, 48, 56, 52, 44, 38, 42, 50, 58, 62, 54, 38, 22];

  const liveOrders = [
    { id: "B-2401", table: "12", items: 4, channel: "SALÓN",    elapsed: "00:04:12", state: "FIRING",   tone: "pink",   total: 1240 },
    { id: "B-2402", table: "QR · 07", items: 2, channel: "QR",  elapsed: "00:01:48", state: "RECIBIDA", tone: "blue",   total: 480 },
    { id: "B-2403", table: "08", items: 6, channel: "SALÓN",    elapsed: "00:11:30", state: "EN BARRA", tone: "green",  total: 1860 },
    { id: "B-2404", table: "TAKE",     items: 3, channel: "TAKE",elapsed: "00:06:55", state: "LISTA",    tone: "green",  total: 720 },
    { id: "B-2405", table: "15", items: 5, channel: "SALÓN",    elapsed: "00:02:11", state: "FIRING",   tone: "pink",   total: 1530 },
    { id: "B-2406", table: "RAPPI",    items: 2, channel: "DEL", elapsed: "00:09:40", state: "RIDER",    tone: "amber",  total: 640 },
    { id: "B-2407", table: "03", items: 4, channel: "SALÓN",    elapsed: "00:00:42", state: "RECIBIDA", tone: "blue",   total: 980 },
  ];

  const tablesGrid = [
    { n: "01", state: "free" },
    { n: "02", state: "active", min: 24, ppl: 4, total: 1840 },
    { n: "03", state: "active", min: 48, ppl: 2, total: 920 },
    { n: "04", state: "billing", min: 62, ppl: 5, total: 2640 },
    { n: "05", state: "free" },
    { n: "06", state: "active", min: 12, ppl: 3, total: 580 },
    { n: "07", state: "reserved", min: null },
    { n: "08", state: "active", min: 35, ppl: 6, total: 2120 },
    { n: "09", state: "free" },
    { n: "10", state: "active", min: 18, ppl: 2, total: 740 },
    { n: "11", state: "billing", min: 71, ppl: 4, total: 1960 },
    { n: "12", state: "active", min: 8, ppl: 4, total: 1240 },
    { n: "13", state: "active", min: 41, ppl: 3, total: 1380 },
    { n: "14", state: "free" },
    { n: "15", state: "active", min: 4, ppl: 5, total: 1530 },
    { n: "16", state: "reserved", min: null },
  ];

  const tones = {
    pink:  { bg: "var(--dash-red-bg)",   fg: "var(--dash-red)",   dot: "var(--pink-light-glow)" },
    blue:  { bg: "var(--dash-blue-bg)",  fg: "var(--dash-blue)",  dot: "var(--dash-blue)" },
    green: { bg: "var(--dash-green-bg)", fg: "var(--dash-green)", dot: "var(--dash-green)" },
    amber: { bg: "rgba(252, 211, 77, 0.10)", fg: "#FCD34D",      dot: "#FCD34D" },
  };

  const stateColors = {
    free:     { bg: "transparent",                                        border: "rgba(255,255,255,0.06)",   fg: "var(--dim)",        accent: null },
    active:   { bg: "rgba(244, 114, 182, 0.06)",                          border: "rgba(244, 114, 182, 0.22)", fg: "var(--light)",     accent: "var(--pink-glow)" },
    billing:  { bg: "rgba(244, 114, 182, 0.18)",                          border: "var(--pink-glow)",          fg: "var(--light)",     accent: "var(--pink-glow)" },
    reserved: { bg: "rgba(167, 243, 208, 0.06)",                          border: "rgba(167, 243, 208, 0.22)", fg: "var(--light)",     accent: "var(--dash-green)" },
  };

  return (
    <div className="bq bq-dark" style={{
      width: 1440, height: 900,
      background: "var(--ink)",
      display: "grid",
      gridTemplateColumns: "224px 1fr",
      fontSize: 13,
      position: "relative",
      overflow: "hidden",
      contain: "strict",
    }}>
      {/* Ambient radial glows (DESIGN.md radial gradient pattern) */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(199,91,122,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(167,243,208,0.06), transparent 60%)",
        pointerEvents: "none",
      }} />
      {/* Film grain */}
      <div className="grain" />

      {/* ========= SIDEBAR ========= */}
      <aside style={{
        background: "var(--burgundy-dark)",
        borderRight: "1px solid var(--wire)",
        padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 22,
        position: "relative",
        zIndex: 2,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg, var(--rose) 0%, var(--rose-light) 100%)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 600,
            fontSize: 18, color: "var(--ink)",
            boxShadow: "0 4px 12px -4px rgba(199,91,122,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}>b</div>
          <div>
            <div className="serif" style={{ fontWeight: 600, fontSize: 18, letterSpacing: "-0.02em", color: "var(--light)", fontStyle: "italic" }}>bouquet</div>
            <div className="mono" style={{ fontSize: 8.5, opacity: 0.45, letterSpacing: "0.3em", color: "var(--light)" }}>HOSPITALITY OS</div>
          </div>
        </div>

        {/* Local switcher */}
        <button style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "10px 12px",
          textAlign: "left",
          cursor: "pointer",
          color: "var(--light)",
        }}>
          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--dim)" }}>LOCAL ACTIVO</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Palermo · Soho</span>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="var(--dim)" strokeWidth="1.4" /></svg>
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>3 sucursales</div>
        </button>

        {/* Nav */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 1, fontSize: 13 }}>
          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--dim)", padding: "0 12px 8px" }}>OPERATIVO</div>
          {[
            { label: "Dashboard", active: true, badge: null },
            { label: "Salón",    active: false, badge: "18" },
            { label: "Órdenes",  active: false, badge: "47" },
            { label: "KDS",      active: false, badge: null },
            { label: "Cobros",   active: false, badge: null },
          ].map((n) => (
            <NavRow key={n.label} {...n} />
          ))}

          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--dim)", padding: "16px 12px 8px" }}>GESTIÓN</div>
          {[
            { label: "Menú",     active: false, badge: null },
            { label: "Equipo",   active: false, badge: null },
            { label: "Reportes", active: false, badge: null },
            { label: "Ajustes",  active: false, badge: null },
          ].map((n) => (
            <NavRow key={n.label} {...n} />
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Sync status */}
        <div style={{
          borderTop: "1px solid var(--wire)",
          paddingTop: 12,
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          color: "var(--dim)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--dash-green)",
              boxShadow: "0 0 6px var(--dash-green)",
              animation: "pulse-slow 2.4s var(--ease) infinite",
            }} />
            <span style={{ color: "var(--light)" }}>SYNC</span>
            <span>· 38ms</span>
          </div>
          <div style={{ marginTop: 4, opacity: 0.7 }}>v 4.12 · ar-AR · MX</div>
        </div>
      </aside>

      {/* ========= MAIN ========= */}
      <main style={{
        padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 14,
        overflow: "hidden",
        minWidth: 0,
        position: "relative",
        zIndex: 2,
      }}>
        {/* Topbar */}
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>VIE · 01 MAY 2026 · 21:47 · SERVICIO ACTIVO</div>
            <h1 className="serif" style={{
              fontSize: 32, margin: "6px 0 0", fontWeight: 500, letterSpacing: "-0.015em",
              color: "var(--light)", lineHeight: 1.05,
            }}>
              Buenas noches, <span style={{ fontStyle: "italic", color: "var(--pink-glow)", fontWeight: 500 }}>Lara</span>.
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LiveDot label="EN VIVO" />
            <div className="glass" style={{
              padding: "8px 14px", borderRadius: 999,
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 12, color: "var(--dim)",
              minWidth: 280,
            }}>
              <svg width="13" height="13" viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M9 9l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              <span style={{ flex: 1 }}>Buscar mesa, orden, comensal…</span>
              <span className="mono" style={{
                fontSize: 9.5, padding: "2px 6px", letterSpacing: "0.05em",
                background: "rgba(255,255,255,0.06)", borderRadius: 4,
                color: "var(--light)",
              }}>⌘K</span>
            </div>
            <button className="glass" style={{
              width: 36, height: 36, borderRadius: 999,
              display: "grid", placeItems: "center", cursor: "pointer", color: "var(--light)", position: "relative",
            }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2a4 4 0 00-4 4v3l-1.5 2h11L12 9V6a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
              <span style={{
                position: "absolute", top: 5, right: 6,
                width: 7, height: 7, borderRadius: "50%",
                background: "var(--pink-glow)",
                boxShadow: "0 0 0 2px var(--ink)",
              }} />
            </button>
            <Avatar initials="LA" hue="var(--pink-glow)" size={36} />
          </div>
        </header>

        {/* KPI strip */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "VENTAS HOY",  value: `$${Math.round(revenue).toLocaleString("es-AR")}`, delta: "+12.4%", deltaTone: "green", trend: hourly,                                                          accent: "pink",  unit: "ARS" },
            { label: "ÓRDENES",     value: Math.round(orders),                                 delta: "+8",     deltaTone: "green", trend: [10,14,12,18,24,22,30,28,34,38,42,40],                          accent: "blue",  unit: "6 EN CURSO" },
            { label: "COMENSALES",  value: 312,                                                delta: "+22",    deltaTone: "green", trend: [16,22,28,32,30,38,44,42,46,50,54,58],                          accent: "pink",  unit: "TURNO 2/3" },
            { label: "TICKET PROM.",value: `$${Math.round(ticket)}`,                            delta: "+$18",   deltaTone: "green", trend: [280,295,310,305,320,332,340,345,348,352,360],                  accent: "green", unit: "POR PERSONA" },
          ].map((k, i) => (
            <KpiCard key={k.label} {...k} delay={i * 80} />
          ))}
        </section>

        {/* Lower grid */}
        <section style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 12, flex: 1, minHeight: 0 }}>

          {/* LEFT — Live orders feed */}
          <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 22 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--wire)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>FEED · ÓRDENES EN VIVO</div>
                <div className="serif" style={{ fontSize: 22, fontWeight: 500, marginTop: 4, color: "var(--light)" }}>
                  El <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>pulso</span> del salón
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, padding: 3, background: "rgba(255,255,255,0.03)", borderRadius: 999, border: "1px solid rgba(255,255,255,0.06)" }}>
                {["TODOS · 47", "SALÓN · 32", "QR · 8", "DELIVERY · 7"].map((t, i) => (
                  <button key={t} style={{
                    fontSize: 9.5, padding: "5px 11px", borderRadius: 999,
                    border: "none",
                    background: i === 0 ? "var(--pink-glow)" : "transparent",
                    color: i === 0 ? "var(--burgundy-dark)" : "var(--dim)",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                    fontWeight: i === 0 ? 700 : 500,
                    cursor: "pointer",
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Table header */}
            <div className="mono" style={{
              display: "grid",
              gridTemplateColumns: "78px 1fr 50px 80px 110px 80px 36px",
              padding: "10px 20px",
              fontSize: 9, letterSpacing: "0.25em",
              color: "var(--dim)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span>ID</span><span>MESA / CANAL</span><span>ITEMS</span><span>TIEMPO</span><span>ESTADO</span><span style={{ textAlign: "right" }}>TOTAL</span><span></span>
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              {liveOrders.map((o, i) => {
                const t = tones[o.tone];
                const isUrgent = parseInt(o.elapsed.split(":")[1]) >= 10;
                return (
                  <div key={o.id} style={{
                    display: "grid",
                    gridTemplateColumns: "78px 1fr 50px 80px 110px 80px 36px",
                    padding: "11px 20px",
                    alignItems: "center",
                    borderBottom: i < liveOrders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    fontSize: 12,
                    color: "var(--light)",
                    animation: `dash-row-enter 500ms ${i * 60}ms var(--ease) both`,
                    background: isUrgent ? "rgba(253,164,175,0.03)" : "transparent",
                    position: "relative",
                  }}>
                    {isUrgent && (
                      <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "var(--pink-glow)" }} />
                    )}
                    <span className="mono" style={{ color: "var(--pink-glow)", fontWeight: 600, letterSpacing: "0.04em" }}>{o.id}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="mono" style={{ fontSize: 11, color: "var(--light)" }}>{o.table}</span>
                      <span className="mono" style={{ fontSize: 8.5, padding: "1px 6px", borderRadius: 3, background: "rgba(255,255,255,0.05)", color: "var(--dim)", letterSpacing: "0.1em" }}>
                        {o.channel}
                      </span>
                    </span>
                    <span className="mono tnum" style={{ color: "var(--dim)" }}>×{o.items}</span>
                    <span className="mono tnum" style={{ color: isUrgent ? "var(--pink-glow)" : "var(--dim)" }}>{o.elapsed}</span>
                    <span>
                      <span className="pill" style={{
                        background: t.bg, color: t.fg,
                        padding: "3px 9px",
                        fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: "0.12em", fontWeight: 600,
                        display: "inline-flex", alignItems: "center", gap: 5,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.dot }} />
                        {o.state}
                      </span>
                    </span>
                    <span className="mono tnum" style={{ fontWeight: 600, textAlign: "right", color: "var(--light)" }}>${o.total}</span>
                    <button style={{
                      background: "transparent", border: "1px solid rgba(255,255,255,0.10)",
                      width: 28, height: 28, borderRadius: 999,
                      cursor: "pointer", color: "var(--light)",
                      display: "grid", placeItems: "center",
                      marginLeft: "auto",
                    }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Footer summary strip */}
            <div style={{
              padding: "10px 20px",
              borderTop: "1px solid var(--wire)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(255,255,255,0.015)",
            }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--dim)" }}>
                MOSTRANDO 7 DE 47 · ACTUALIZADO HACE 2s
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 10 }} className="mono">
                <span style={{ color: "var(--dim)" }}>FIRING <span style={{ color: "var(--pink-glow)", fontWeight: 700 }}>2</span></span>
                <span style={{ color: "var(--dim)" }}>EN COCINA <span style={{ color: "var(--dash-blue)", fontWeight: 700 }}>4</span></span>
                <span style={{ color: "var(--dim)" }}>LISTAS <span style={{ color: "var(--dash-green)", fontWeight: 700 }}>3</span></span>
                <span style={{ color: "var(--dim)" }}>DEMORA <span style={{ color: "#FCD34D", fontWeight: 700 }}>1</span></span>
              </div>
            </div>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>

            {/* Sales chart with line */}
            <div className="card" style={{ padding: 18, borderRadius: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>VENTAS · POR HORA</div>
                  <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                    Hoy vs <span style={{ fontStyle: "italic", color: "var(--dim)" }}>ayer</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--dim)" }} className="mono">
                    <span style={{ width: 10, height: 2, background: "var(--pink-glow)" }} /> HOY
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--dim)" }} className="mono">
                    <span style={{ width: 10, height: 2, background: "rgba(255,255,255,0.2)", borderTop: "1px dashed var(--dim)" }} /> AYER
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <DualLineChart
                  hoy={hourly}
                  ayer={[3, 6, 10, 14, 18, 22, 26, 24, 20, 24, 30, 36, 40, 46, 42, 36, 32, 36, 42, 48, 50, 42, 30, 16]}
                  w={420} h={90}
                />
              </div>
              <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--dim)", marginTop: 6 }}>
                <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span>
              </div>
            </div>

            {/* Salon mini map */}
            <div className="card" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", borderRadius: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>SALÓN · 18/24 OCUPADAS</div>
                  <div className="serif" style={{ fontSize: 18, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                    Estado del <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>jardín</span>
                  </div>
                </div>
                <button className="mono" style={{
                  fontSize: 9.5, padding: "5px 10px", borderRadius: 999,
                  background: "transparent", border: "1px solid rgba(255,255,255,0.10)",
                  color: "var(--light)", letterSpacing: "0.15em", cursor: "pointer",
                }}>VER PLANO ↗</button>
              </div>

              {/* Legend */}
              <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 9.5 }} className="mono">
                {[
                  { l: "ACTIVA", c: "var(--pink-glow)", count: 12 },
                  { l: "COBRO", c: "var(--pink-glow)", count: 2, solid: true },
                  { l: "RESERV.", c: "var(--dash-green)", count: 2 },
                  { l: "LIBRE", c: "var(--dim)", count: 4 },
                ].map(s => (
                  <span key={s.l} style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--dim)" }}>
                    <span style={{
                      width: 9, height: 9, borderRadius: 3,
                      background: s.solid ? s.c : "transparent",
                      border: s.solid ? "none" : `1px solid ${s.c}`,
                    }} />
                    {s.l} · <span style={{ color: "var(--light)", fontWeight: 700 }}>{s.count}</span>
                  </span>
                ))}
              </div>

              <div style={{
                marginTop: 14, flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(4, 1fr)",
                gap: 6,
              }}>
                {tablesGrid.map((t, i) => {
                  const c = stateColors[t.state];
                  return (
                    <div key={t.n} style={{
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderRadius: 10,
                      padding: "8px 9px",
                      display: "flex", flexDirection: "column",
                      justifyContent: "space-between",
                      color: c.fg,
                      minHeight: 0,
                      position: "relative",
                      overflow: "hidden",
                      animation: `dash-stat-enter 400ms ${i * 25}ms var(--ease) both`,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <span className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{t.n}</span>
                        {c.accent && t.state === "billing" && (
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: c.accent,
                            boxShadow: `0 0 6px ${c.accent}`,
                            animation: "pulse-slow 1.4s var(--ease) infinite",
                          }} />
                        )}
                      </div>
                      {t.state === "active" || t.state === "billing" ? (
                        <div>
                          <div className="mono tnum" style={{ fontSize: 10, color: c.fg, fontWeight: 600 }}>${t.total}</div>
                          <div className="mono tnum" style={{ fontSize: 8.5, color: "var(--dim)", letterSpacing: "0.05em" }}>
                            {t.ppl}p · {t.min}m
                          </div>
                        </div>
                      ) : t.state === "reserved" ? (
                        <div className="mono" style={{ fontSize: 8.5, color: "var(--dash-green)", letterSpacing: "0.1em" }}>
                          21:30
                        </div>
                      ) : (
                        <div className="mono" style={{ fontSize: 8.5, color: "var(--dim)", letterSpacing: "0.15em" }}>
                          LIBRE
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// ====== Sidebar nav row ======
const NavRow = ({ label, active, badge }) => (
  <div style={{
    padding: "8px 12px",
    borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: active ? "rgba(244,114,182,0.10)" : "transparent",
    color: active ? "var(--light)" : "var(--dim)",
    fontWeight: active ? 600 : 400,
    cursor: "pointer",
    fontSize: 13,
    position: "relative",
  }}>
    {active && <span style={{ position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 2px 2px 0", background: "var(--pink-glow)", boxShadow: "0 0 6px var(--pink-glow)" }} />}
    <span>{label}</span>
    {badge && <span className="mono" style={{
      fontSize: 9.5, padding: "1px 6px",
      background: active ? "rgba(244,114,182,0.18)" : "rgba(255,255,255,0.05)",
      color: active ? "var(--pink-glow)" : "var(--dim)",
      borderRadius: 4, letterSpacing: "0.05em",
    }}>{badge}</span>}
  </div>
);

// ====== KPI card ======
const KpiCard = ({ label, value, delta, deltaTone, trend, accent, unit, delay }) => {
  const accentColor = {
    pink:  "var(--pink-glow)",
    blue:  "var(--dash-blue)",
    green: "var(--dash-green)",
  }[accent] || "var(--pink-glow)";
  const deltaColor = deltaTone === "green" ? "var(--dash-green)" : "var(--pink-light-glow)";
  const deltaBg    = deltaTone === "green" ? "var(--dash-green-bg)" : "var(--dash-red-bg)";

  return (
    <div className="card" style={{
      padding: 16,
      borderRadius: 20,
      position: "relative", overflow: "hidden",
      animation: `dash-stat-enter 600ms ${delay}ms var(--ease) both`,
    }}>
      {/* corner accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor} 50%, transparent)`,
        opacity: 0.4,
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.3em", color: "var(--dim)" }}>{label}</span>
        <span className="mono" style={{
          fontSize: 9.5, padding: "2px 7px", borderRadius: 999,
          background: deltaBg, color: deltaColor, fontWeight: 700, letterSpacing: "0.05em",
          display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          <span style={{ fontSize: 8 }}>↑</span>{delta}
        </span>
      </div>
      <div className="mono tnum" style={{
        fontSize: 30, fontWeight: 700, marginTop: 10,
        letterSpacing: "-0.03em",
        color: "var(--light)", lineHeight: 1,
      }}>{value}</div>
      <div className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.15em", marginTop: 4 }}>{unit}</div>
      <div style={{ marginTop: 8, marginLeft: -2, marginRight: -2 }}>
        <Sparkline data={trend} color={accentColor} w={172} h={28} />
      </div>
    </div>
  );
};

// ====== Dual line chart ======
const DualLineChart = ({ hoy, ayer, w, h }) => {
  const allData = [...hoy, ...ayer];
  const max = Math.max(...allData);
  const min = 0;
  const range = max - min || 1;
  const stepH = w / (hoy.length - 1);
  const stepA = w / (ayer.length - 1);
  const padBot = 4;
  const drawArea = h - padBot;

  const ptsHoy = hoy.map((v, i) => [i * stepH, drawArea - (v / range) * drawArea * 0.92]);
  const ptsAyer = ayer.map((v, i) => [i * stepA, drawArea - (v / range) * drawArea * 0.92]);

  const linePathHoy = ptsHoy.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fillPathHoy = `${linePathHoy} L ${w} ${h} L 0 ${h} Z`;
  const linePathAyer = ptsAyer.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", display: "block" }}>
      <defs>
        <linearGradient id="hoyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--pink-glow)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--pink-glow)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Horizontal grid */}
      {[0.25, 0.5, 0.75].map(p => (
        <line key={p} x1="0" x2={w} y1={drawArea * p} y2={drawArea * p}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="2 4" />
      ))}
      {/* Ayer (dashed) */}
      <path d={linePathAyer} fill="none" stroke="var(--dim)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.5" />
      {/* Hoy fill */}
      <path d={fillPathHoy} fill="url(#hoyGrad)" />
      {/* Hoy line */}
      <path d={linePathHoy} fill="none" stroke="var(--pink-glow)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {ptsHoy.length && (
        <>
          <circle cx={ptsHoy[ptsHoy.length-1][0]} cy={ptsHoy[ptsHoy.length-1][1]} r="6" fill="var(--pink-glow)" opacity="0.25" />
          <circle cx={ptsHoy[ptsHoy.length-1][0]} cy={ptsHoy[ptsHoy.length-1][1]} r="3" fill="var(--pink-glow)" />
        </>
      )}
    </svg>
  );
};

window.VariantA = VariantA;
