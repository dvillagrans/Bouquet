"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users, Unlink, QrCode } from "lucide-react";
import type { TableStatus } from "@/lib/prisma-legacy-types";
import { StatusDot } from "./ui/status-dot";
import { GuestAvatar } from "./ui/guest-avatar";
import { SessionTimeRing } from "./ui/session-time-ring";
import type { WaiterTableSummary } from "./types";
import { cn } from "@/lib/utils";

const MXN = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });

function isTableBusy(status: TableStatus) {
  return status === "OCUPADA" || status === "CERRANDO";
}

function tableStatusLabel(status: TableStatus) {
  if (status === "DISPONIBLE") return "Libre";
  if (status === "OCUPADA") return "Activa";
  if (status === "CERRANDO") return "Cuenta";
  return "Limpieza";
}

function statusVisuals(
  table: WaiterTableSummary,
): {
  color: string;
  tint: string;
  numberUrgent: boolean;
} {
  const st = table.status;
  if (st === "DISPONIBLE") {
    return {
      color: "var(--color-dash-green)",
      tint: "rgba(77, 132, 96, 0.18)",
      numberUrgent: false,
    };
  }
  if (st === "OCUPADA") {
    return {
      color: "var(--color-gold)",
      tint: "rgba(201, 160, 84, 0.16)",
      numberUrgent: table.readyCount > 0,
    };
  }
  if (st === "CERRANDO") {
    return {
      color: "var(--color-gold)",
      tint: "rgba(201, 160, 84, 0.2)",
      numberUrgent: true,
    };
  }
  return {
    color: "var(--color-dash-red)",
    tint: "rgba(160, 64, 64, 0.2)",
    numberUrgent: true,
  };
}

const spring = { type: "spring" as const, stiffness: 280, damping: 24 };

export function WaiterMesaCard({
  table,
  allowJoinTables,
  isJoinMode,
  isSelectedToJoin,
  joinOrderIndex,
  isInGroup,
  qrError,
  onCardClick,
  onClean,
  onRegenerateQr,
  onSeparate,
  confirmQrId,
  label,
}: {
  table: WaiterTableSummary;
  allowJoinTables: boolean;
  isJoinMode: boolean;
  isSelectedToJoin: boolean;
  joinOrderIndex: number;
  isInGroup: boolean;
  qrError?: string | null;
  onCardClick: () => void;
  onClean: () => void;
  onRegenerateQr: () => void;
  onSeparate: () => void;
  confirmQrId: string | null;
  label?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);
  const busy = isTableBusy(table.status);
  const seatedMin =
    busy && table.activeSession
      ? Math.floor((now - new Date(table.activeSession.createdAt).getTime()) / 60000)
      : 0;

  const vis = statusVisuals(table);
  const halo =
    table.status === "SUCIA" || table.readyCount > 0 || table.pendingCount > 3
      ? `0 0 0 1px ${vis.tint}, 0 20px 42px -26px ${vis.tint}`
      : undefined;

  const numberClass = vis.numberUrgent || table.readyCount > 0 ? "" : "text-light";
  const numberStyle: { color?: string } | undefined =
    vis.numberUrgent || table.readyCount > 0 ? { color: vis.color } : undefined;

  return (
    <motion.article
      layout
      layoutId={`mesa-card-${table.id}`}
      onClick={onCardClick}
      style={
        {
          "--status-color": vis.color,
          "--status-tint": vis.tint,
          boxShadow: halo,
        } as React.CSSProperties
      }
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={spring}
      className={cn(
        "group relative flex h-full min-h-0 cursor-pointer flex-col overflow-hidden rounded-[20px] border border-border-main bg-bg-card p-4 sm:p-5 shadow-[inset_0_1px_0_var(--status-color)]",
        isJoinMode && isInGroup && "cursor-not-allowed",
        isJoinMode && isInGroup && "opacity-[0.55]",
        isSelectedToJoin && "ring-2 ring-gold ring-offset-2 ring-offset-bg-solid",
      )}
    >
      {isJoinMode && isInGroup && (
        <div
          className="pointer-events-none absolute inset-0 z-[5] opacity-[0.35]"
          style={{
            background:
              "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(132,126,114,0.08) 6px, rgba(132,126,114,0.08) 12px)",
          }}
          aria-hidden
        />
      )}

      {isSelectedToJoin && (
        <div className="absolute right-3 top-3 z-20 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-gold bg-gold px-2 font-mono text-[11px] font-bold text-bg-solid">
          {joinOrderIndex + 1}
        </div>
      )}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-4">
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border-main bg-bg-solid/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-light">
              <StatusDot status={table.status} />
              {tableStatusLabel(table.status)}
            </span>
            {isInGroup && (
              <div className="inline-flex items-center gap-1 rounded-full border border-gold/35 bg-gold/15 pl-2.5 pr-1 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-gold">
                Grupo
                {allowJoinTables && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeparate();
                    }}
                    className="ml-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full text-gold transition hover:text-dash-red"
                    title="Deshacer grupo"
                  >
                    <Unlink className="h-3 w-3" strokeWidth={2} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex items-start gap-2">
            {busy && table.activeSession ? (
              <SessionTimeRing minutes={seatedMin} warnMinutes={45} />
            ) : (
              <span className="h-11 w-11 shrink-0" aria-hidden />
            )}
            {busy && (
              <div className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border-main/70 bg-bg-solid/60 px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums text-light">
                <Users className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.8} aria-hidden />
                {table.activeSession?.pax ?? 0}
              </div>
            )}
          </div>
        </header>

        <div className="space-y-2">
          <p className="text-[11px] font-medium text-text-muted">Mesa</p>
          <p
            className={cn(
              "font-semibold tabular-nums leading-none tracking-[-0.04em] sm:text-[56px]",
              label ? "text-[38px] sm:text-[42px]" : "text-[52px]",
              numberClass,
            )}
            style={numberStyle}
          >
            {label ?? table.number}
          </p>
          <div className="flex min-h-[28px] items-center gap-2">
            {table.activeSession ? (
              <>
                <GuestAvatar name={table.activeSession.guestName} />
                <p className="line-clamp-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  {table.activeSession.guestName}
                </p>
              </>
            ) : (
              <>
                <Users className="h-5 w-5 shrink-0 text-text-muted/60" strokeWidth={1.5} aria-hidden />
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Esperando comensales
                </p>
              </>
            )}
          </div>
        </div>

        {qrError ? (
          <div className="rounded-xl border border-dash-red/45 bg-dash-red/10 px-3 py-2 font-mono text-[10px] leading-relaxed text-dash-red">
            {qrError}
          </div>
        ) : null}

        {/* Bloque inferior fijo: métricas + franja de acción con altura mínima siempre (evita cards más bajas en mesas activas sin botón). */}
        <div className="mt-auto flex min-h-0 flex-col gap-3 pt-2">
          <div className="border-t border-border-main/60 pt-4">
            <div className="grid grid-cols-3 divide-x divide-border-main/50 text-center">
              <div className="px-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Cocina
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-light">{table.pendingCount}</p>
              </div>
              <div className="px-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Listos
                </p>
                <p className="mt-1 flex items-center justify-center gap-1 font-mono text-lg font-semibold tabular-nums text-light">
                  {table.readyCount > 0 ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dash-green" aria-hidden />
                  ) : null}
                  {table.readyCount}
                </p>
              </div>
              <div className="px-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Total
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-gold">
                  {busy && table.billTotal > 0 ? `$${MXN.format(table.billTotal)}` : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-11 flex-wrap items-center gap-2 opacity-100 transition group-hover:opacity-100 md:opacity-90">
            {table.status === "SUCIA" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClean();
                }}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-border-main bg-bg-solid px-3 text-xs font-medium text-light transition hover:border-dash-red hover:bg-dash-red/10 active:scale-[0.98]"
              >
                Marcar libre
              </button>
            )}

            {table.status === "DISPONIBLE" && !isInGroup && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerateQr();
                }}
                className={cn(
                  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium transition active:scale-[0.98]",
                  confirmQrId === table.id
                    ? "border-gold bg-gold text-bg-solid"
                    : "border-border-main text-text-muted hover:border-gold hover:text-gold",
                )}
                title="Generar nuevo QR"
              >
                <QrCode className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                {confirmQrId === table.id ? "Confirmar QR" : "Renovar QR"}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
