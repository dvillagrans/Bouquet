"use client";

import type { TableStatus } from "@/lib/prisma-legacy-types";

const STATUS_DOT_CLASS: Record<TableStatus, string> = {
  DISPONIBLE: "bg-dash-green",
  OCUPADA: "bg-gold",
  CERRANDO: "bg-gold",
  SUCIA: "bg-dash-red",
};

export function StatusDot({
  status,
  className = "",
  "aria-hidden": ariaHidden = true,
}: {
  status: TableStatus;
  className?: string;
  "aria-hidden"?: boolean;
}) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[status]} ${className}`}
      aria-hidden={ariaHidden}
    />
  );
}
