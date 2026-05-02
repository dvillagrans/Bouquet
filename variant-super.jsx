// Variant SUPER — Super-admin dashboard ("Bouquet Control")
// Vista god-mode: todas las cadenas, todos los locales, métricas de sistema,
// salud de infra, alertas globales. Mismo lenguaje visual que Variant A pero
// orientado a multi-tenant overview.
const VariantSuper = () => {
  const mrr = useTickingNumber(284600);
  const locales = useTickingNumber(312);
  const ordersNow = useTickingNumber(2847);
  const gmv = useTickingNumber(1284000);

  // Sparkline data
  const ordersHourly = [120, 180, 240, 320, 410, 480, 520, 560, 610, 680, 720, 790, 840, 890, 920, 950, 980, 1020, 1100, 1180, 1240, 1290, 1320, 1340];

  // Chains data — top tenants
  const chains = [
    { name: "Don Julio Group",   logo: "DJ", country: "AR", locales: 24, mrr: 38400, gmv: 142000, health: 0.96, trend: [22, 28, 34, 38, 42, 40, 44, 48, 52, 56, 58], status: "stable" },
    { name: "Tacombi",           logo: "TC", country: "MX", locales: 18, mrr: 28800, gmv: 96000,  health: 0.92, trend: [12, 18, 22, 28, 32, 36, 38, 42, 44, 46, 48], status: "stable" },
    { name: "Astor",             logo: "AS", country: "AR", locales: 12, mrr: 19200, gmv: 64000,  health: 0.88, trend: [18, 16, 20, 22, 24, 26, 24, 28, 30, 32, 34], status: "warn" },
    { name: "Pizzería Güerrín",  logo: "PG", country: "AR", locales:  8, mrr: 12800, gmv: 48000,  health: 0.99, trend: [10, 14, 18, 22, 26, 30, 32, 36, 38, 40, 42], status: "stable" },
    { name: "Café Tortoni",      logo: "CT", country: "AR", locales:  6, mrr:  9600, gmv: 32000,  health: 0.94, trend: [ 8, 12, 14, 18, 20, 22, 24, 26, 28, 30, 32], status: "stable" },
    { name: "Quintonil",         logo: "QN", country: "MX", locales:  3, mrr:  4800, gmv: 18000,  health: 0.78, trend: [ 6,  8, 10, 12, 14, 12, 14, 16, 18, 20, 14], status: "alert" },
  ];

  const regions = [
    { code: "AR · BA", locales: 142, pct: 0.46, color: "var(--pink-glow)" },
    { code: "AR · CBA", locales: 38, pct: 0.12, color: "var(--rose-light)" },
    { code: "MX · CDMX", locales: 64, pct: 0.21, color: "var(--dash-blue)" },
    { code: "MX · MTY", locales: 28, pct: 0.09, color: "#93C5FD" },
    { code: "UY · MVD", locales: 24, pct: 0.08, color: "var(--dash-green)" },
    { code: "OTROS", locales: 16, pct: 0.04, color: "var(--dim)" },
  ];

  const alerts = [
    { sev: "crit",  area: "Quintonil · Polanco",     msg: "Sync caído > 8m",          time: "21:39", link: "TENANT" },
    { sev: "warn",  area: "Astor · Recoleta",         msg: "Latencia KDS 1.2s p95",    time: "21:42", link: "INFRA"  },
    { sev: "warn",  area: "Pago Mercadolibre",        msg: "Errores 3.2% (umbral 1%)", time: "21:35", link: "PAYM"   },
    { sev: "info",  area: "Don Julio Group",          msg: "Nuevo local activado",     time: "21:18", link: "TENANT" },
    { sev: "info",  area: "Sistema",                  msg: "Deploy v4.12 completado",  time: "20:52", link: "DEPLOY" },
  ];
  const sevColors = {
    crit: { bg: "var(--dash-red-bg)",   fg: "var(--pink-light-glow)", dot: "var(--pink-light-glow)" },
    warn: { bg: "rgba(252,211,77,0.10)",fg: "#FCD34D",                dot: "#FCD34D" },
    info: { bg: "var(--dash-blue-bg)",  fg: "var(--dash-blue)",       dot: "var(--dash-blue)" },
  };

  const services = [
    { name: "API · core",       up: 99.99, ms: 42,  ok: true },
    { name: "Realtime · WS",    up: 99.97, ms: 18,  ok: true },
    { name: "KDS · gateway",    up: 99.82, ms: 280, ok: true },
    { name: "Pagos · MP",       up: 96.80, ms: 320, ok: false },
    { name: "Pagos · Stripe",   up: 99.95, ms: 110, ok: true },
    { name: "Search · OpenSearch", up: 99.91, ms: 64,  ok: true },
  ];

  return (
    <div className="bq bq-dark" style={{
      width: 1440, height: 900,
      background: "var(--ink)",
      display: "grid",
      gridTemplateColumns: "232px 1fr",
      fontSize: 13,
      position: "relative",
      overflow: "hidden",
      contain: "strict",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(244,114,182,0.16), transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(167,243,208,0.05), transparent 60%)",
        pointerEvents: "none",
      }} />
      <div className="grain" />

      {/* ============ SIDEBAR ============ */}
      <aside style={{
        background: "var(--burgundy-dark)",
        borderRight: "1px solid var(--wire)",
        padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: 22,
        position: "relative", zIndex: 2,
      }}>
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
            <div className="mono" style={{ fontSize: 8.5, opacity: 0.55, letterSpacing: "0.3em", color: "var(--pink-glow)" }}>CONTROL · GOD</div>
          </div>
        </div>

        <button style={{
          background: "rgba(244,114,182,0.08)",
          border: "1px solid rgba(244,114,182,0.20)",
          borderRadius: 10, padding: "10px 12px",
          textAlign: "left", cursor: "pointer", color: "var(--light)",
        }}>
          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--pink-glow)" }}>VISTA</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>Toda la red</span>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="var(--dim)" strokeWidth="1.4" /></svg>
          </div>
          <div className="mono" style={{ fontSize: 10, color: "var(--dim)", marginTop: 2 }}>42 cadenas · 312 locales</div>
        </button>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--dim)", padding: "0 12px 8px" }}>OVERVIEW</div>
          {[
            { label: "Control", active: true, badge: null },
            { label: "Cadenas", active: false, badge: "42" },
            { label: "Locales", active: false, badge: "312" },
            { label: "Usuarios", active: false, badge: "8.2k" },
          ].map((n) => <NavRow key={n.label} {...n} />)}
          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--dim)", padding: "16px 12px 8px" }}>SISTEMA</div>
          {[
            { label: "Infraestructura", active: false, badge: null },
            { label: "Pagos", active: false, badge: "3" },
            { label: "Integraciones", active: false, badge: null },
            { label: "Despliegues", active: false, badge: null },
            { label: "Auditoría", active: false, badge: null },
          ].map((n) => <NavRow key={n.label} {...n} />)}
          <div className="eyebrow" style={{ fontSize: 8.5, letterSpacing: "0.3em", color: "var(--dim)", padding: "16px 12px 8px" }}>NEGOCIO</div>
          {[
            { label: "Facturación", active: false, badge: null },
            { label: "Plans & SLAs", active: false, badge: null },
          ].map((n) => <NavRow key={n.label} {...n} />)}
        </nav>

        <div style={{ flex: 1 }} />

        <div style={{
          borderTop: "1px solid var(--wire)", paddingTop: 12,
          fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--dim)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--dash-green)", boxShadow: "0 0 6px var(--dash-green)",
              animation: "pulse-slow 2.4s var(--ease) infinite",
            }} />
            <span style={{ color: "var(--light)" }}>ALL SYSTEMS</span>
          </div>
          <div style={{ marginTop: 4, opacity: 0.7 }}>region us-east-1 · prod</div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main style={{
        padding: "20px 24px",
        display: "flex", flexDirection: "column", gap: 14,
        overflow: "hidden", minWidth: 0,
        position: "relative", zIndex: 2,
      }}>
        {/* Top bar */}
        <header style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>
              VIE · 01 MAY 2026 · 21:47 · CONTROL CENTER
            </div>
            <h1 className="serif" style={{
              fontSize: 28, margin: "6px 0 0", fontWeight: 500, letterSpacing: "-0.015em",
              color: "var(--light)", lineHeight: 1.05, whiteSpace: "nowrap",
            }}>
              Toda la <span style={{ fontStyle: "italic", color: "var(--pink-glow)", fontWeight: 500 }}>red</span>, una pantalla.
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="mono" style={{
              padding: "5px 10px", borderRadius: 999,
              background: "var(--dash-red-bg)", color: "var(--pink-light-glow)",
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--pink-light-glow)", animation: "pulse-slow 1.4s infinite" }} />
              1 INCIDENTE
            </span>
            <LiveDot label="LIVE" />
            <div className="glass" style={{
              padding: "8px 14px", borderRadius: 999,
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 12, color: "var(--dim)", minWidth: 240,
            }}>
              <svg width="13" height="13" viewBox="0 0 12 12"><circle cx="5" cy="5" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" /><path d="M9 9l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              <span style={{ flex: 1 }}>Buscar cadena, local…</span>
              <span className="mono" style={{ fontSize: 9.5, padding: "2px 6px", background: "rgba(255,255,255,0.06)", borderRadius: 4, color: "var(--light)" }}>⌘K</span>
            </div>
            <Avatar initials="MN" hue="var(--pink-glow)" size={36} />
          </div>
        </header>

        {/* KPI strip */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "MRR · RED",      value: `$${(mrr/1000).toFixed(1)}k`, delta: "+8.2%", deltaTone: "green", trend: [180,200,220,240,250,260,265,272,280,284], accent: "pink",  unit: "USD · MAY 2026" },
            { label: "GMV HOY",        value: `$${(gmv/1000).toFixed(0)}k`,  delta: "+14%",  deltaTone: "green", trend: [400,520,680,820,920,1040,1140,1200,1284],  accent: "blue",  unit: "USD · TIEMPO REAL" },
            { label: "ÓRDENES · LIVE", value: Math.round(ordersNow).toLocaleString("es-AR"), delta: "+312", deltaTone: "green", trend: ordersHourly.slice(-12), accent: "pink", unit: "EN COCINA AHORA" },
            { label: "LOCALES · UP",   value: `${Math.round(locales)}/${Math.round(locales)+4}`, delta: "98.7%", deltaTone: "green", trend: [304,306,308,309,310,311,312,312,312,311,312], accent: "green", unit: "UPTIME 30D" },
          ].map((k, i) => <KpiCard key={k.label} {...k} delay={i*80} />)}
        </section>

        {/* Lower grid: 3 cols */}
        <section style={{ display: "grid", gridTemplateColumns: "1.3fr 0.95fr 0.85fr", gap: 12, flex: 1, minHeight: 0 }}>

          {/* CHAINS LEAGUE TABLE */}
          <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 22 }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--wire)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>CADENAS · TOP PERFORMERS</div>
                <div className="serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                  El <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>ramo</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4, padding: 3, background: "rgba(255,255,255,0.03)", borderRadius: 999, border: "1px solid rgba(255,255,255,0.06)" }}>
                {["GMV", "MRR", "LOCALES"].map((t, i) => (
                  <button key={t} style={{
                    fontSize: 9.5, padding: "4px 10px", borderRadius: 999, border: "none",
                    background: i === 0 ? "var(--pink-glow)" : "transparent",
                    color: i === 0 ? "var(--burgundy-dark)" : "var(--dim)",
                    fontFamily: "var(--font-mono)", letterSpacing: "0.12em",
                    fontWeight: i === 0 ? 700 : 500, cursor: "pointer",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mono" style={{
              display: "grid", gridTemplateColumns: "14px minmax(0,1fr) 32px 38px 56px 50px 44px 12px",
              padding: "9px 18px", fontSize: 9, letterSpacing: "0.2em",
              color: "var(--dim)", borderBottom: "1px solid rgba(255,255,255,0.04)", gap: 8,
            }}>
              <span>#</span><span>CADENA</span><span></span><span style={{ textAlign: "right" }}>LOC</span><span style={{ textAlign: "right" }}>GMV/D</span><span style={{ textAlign: "right" }}>MRR</span><span>HEALTH</span><span></span>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              {chains.map((c, i) => (
                <div key={c.name} style={{
                  display: "grid", gridTemplateColumns: "14px minmax(0,1fr) 32px 38px 56px 50px 44px 12px",
                  padding: "11px 18px", alignItems: "center", gap: 8,
                  borderBottom: i < chains.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  fontSize: 12, color: "var(--light)",
                  animation: `dash-row-enter 500ms ${i * 60}ms var(--ease) both`,
                }}>
                  <span className="mono" style={{ color: "var(--dim)", fontSize: 10 }}>{String(i+1).padStart(2,"0")}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                    <span style={{
                      width: 26, height: 26, borderRadius: 7,
                      background: `linear-gradient(135deg, hsl(${i*55+340} 60% 60%) 0%, hsl(${i*55+340} 60% 40%) 100%)`,
                      display: "grid", placeItems: "center",
                      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 9,
                      color: "var(--ink)", letterSpacing: "-0.02em",
                    }}>{c.logo}</span>
                    <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span style={{ fontWeight: 500, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                      <span className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.15em" }}>{c.country}</span>
                    </span>
                  </span>
                  <Sparkline data={c.trend} w={28} h={18} fill={false} color={c.status === "alert" ? "var(--pink-light-glow)" : c.status === "warn" ? "#FCD34D" : "var(--dash-green)"} />
                  <span className="mono tnum" style={{ color: "var(--light)", textAlign: "right" }}>{c.locales}</span>
                  <span className="mono tnum" style={{ textAlign: "right", fontWeight: 600 }}>${(c.gmv/1000).toFixed(0)}k</span>
                  <span className="mono tnum" style={{ textAlign: "right", color: "var(--dim)" }}>${(c.mrr/1000).toFixed(1)}k</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{
                      flex: 1, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden",
                    }}>
                      <span style={{
                        display: "block", height: "100%", width: `${c.health*100}%`,
                        background: c.health > 0.9 ? "var(--dash-green)" : c.health > 0.85 ? "#FCD34D" : "var(--pink-light-glow)",
                      }} />
                    </span>
                  </span>
                  <button style={{
                    background: "transparent", border: "none", padding: 0, cursor: "pointer",
                    color: "var(--dim)", display: "grid", placeItems: "center",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <div style={{
              padding: "9px 18px", borderTop: "1px solid var(--wire)",
              display: "flex", justifyContent: "space-between",
              background: "rgba(255,255,255,0.015)",
            }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: "var(--dim)" }}>6 / 42 CADENAS</span>
              <button className="mono" style={{
                fontSize: 10, padding: 0, background: "transparent", border: "none",
                color: "var(--pink-glow)", letterSpacing: "0.2em", cursor: "pointer", fontWeight: 700,
              }}>VER TODAS ↗</button>
            </div>
          </div>

          {/* MIDDLE: alerts + regions + GMV chart stacked */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            {/* GMV Chart */}
            <div className="card" style={{ padding: 16, borderRadius: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>GMV · 24H</div>
                  <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                    Flujo <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>continuo</span>
                  </div>
                </div>
                <span className="mono tnum" style={{ fontSize: 18, fontWeight: 700, color: "var(--light)" }}>$1.28M</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <DualLineChart
                  hoy={ordersHourly}
                  ayer={[100,140,200,280,360,420,460,500,550,610,650,720,770,820,860,890,920,960,1040,1110,1170,1220,1250,1280]}
                  w={320} h={70}
                />
              </div>
              <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--dim)", marginTop: 4 }}>
                <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>24h</span>
              </div>
            </div>

            {/* Alerts */}
            <div className="card" style={{ padding: 0, borderRadius: 22, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--wire)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>ALERTAS · 5</div>
                  <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                    <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>Espinas</span> a sacar
                  </div>
                </div>
                <button className="mono" style={{
                  fontSize: 9, padding: "4px 8px", borderRadius: 999, background: "transparent",
                  border: "1px solid rgba(255,255,255,0.10)", color: "var(--dim)", letterSpacing: "0.12em", cursor: "pointer",
                }}>FILTRAR</button>
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                {alerts.map((a, i) => {
                  const c = sevColors[a.sev];
                  return (
                    <div key={i} style={{
                      padding: "10px 16px", display: "flex", gap: 10,
                      borderBottom: i < alerts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      animation: `dash-row-enter 500ms ${i * 60}ms var(--ease) both`,
                      position: "relative",
                    }}>
                      {a.sev === "crit" && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: c.dot }} />}
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", background: c.dot, marginTop: 5, flexShrink: 0,
                        boxShadow: a.sev === "crit" ? `0 0 6px ${c.dot}` : "none",
                        animation: a.sev === "crit" ? "pulse-slow 1.4s infinite" : "none",
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                          <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--light)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.area}</span>
                          <span className="mono" style={{ fontSize: 9, color: "var(--dim)", flexShrink: 0 }}>{a.time}</span>
                        </div>
                        <div style={{ fontSize: 11, color: c.fg, marginTop: 1 }}>{a.msg}</div>
                        <div className="mono" style={{ fontSize: 8.5, color: "var(--dim)", letterSpacing: "0.15em", marginTop: 2 }}>{a.link} ↗</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: regions + system health */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            {/* Regional split */}
            <div className="card" style={{ padding: 16, borderRadius: 22 }}>
              <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>DISTRIBUCIÓN · POR REGIÓN</div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                312 <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>locales</span>
              </div>
              <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", marginTop: 12 }}>
                {regions.map(r => <div key={r.code} style={{ flex: r.pct, background: r.color }} />)}
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {regions.map(r => (
                  <div key={r.code} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--light)" }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
                      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em" }}>{r.code}</span>
                    </span>
                    <span className="mono tnum" style={{ color: "var(--dim)" }}>{r.locales} · {Math.round(r.pct*100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System health */}
            <div className="card" style={{ padding: 16, borderRadius: 22, flex: 1, display: "flex", flexDirection: "column" }}>
              <div className="eyebrow" style={{ fontSize: 10, letterSpacing: "0.3em", color: "var(--dim)" }}>INFRA · STATUS</div>
              <div className="serif" style={{ fontSize: 17, fontWeight: 500, marginTop: 2, color: "var(--light)" }}>
                Salud del <span style={{ fontStyle: "italic", color: "var(--pink-glow)" }}>jardín</span>
              </div>
              <div style={{ marginTop: 12, flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {services.map((s, i) => (
                  <div key={s.name} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    animation: `dash-row-enter 500ms ${i * 50}ms var(--ease) both`,
                  }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: s.ok ? "var(--dash-green)" : "var(--pink-light-glow)",
                      boxShadow: s.ok ? "0 0 4px var(--dash-green)" : "0 0 6px var(--pink-light-glow)",
                      animation: s.ok ? "none" : "pulse-slow 1.4s infinite",
                    }} />
                    <span style={{ flex: 1, fontSize: 11, color: "var(--light)" }}>{s.name}</span>
                    <span className="mono tnum" style={{ fontSize: 10, color: "var(--dim)", letterSpacing: "0.05em" }}>{s.up.toFixed(2)}%</span>
                    <span className="mono tnum" style={{ fontSize: 10, color: s.ms > 200 ? "#FCD34D" : "var(--dim)", width: 44, textAlign: "right" }}>{s.ms}ms</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.04)",
                display: "flex", justifyContent: "space-between",
              }}>
                <span className="mono" style={{ fontSize: 9, color: "var(--dim)", letterSpacing: "0.15em" }}>p95 · 30D</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--pink-glow)", letterSpacing: "0.15em", cursor: "pointer" }}>STATUS PAGE ↗</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

window.VariantSuper = VariantSuper;
