"use client";

import { useTransition } from "react";
import { updateTableStatus, closeTable } from "@/actions/waiter";
import { Users, Receipt, RefreshCcw, Lock } from "lucide-react";
import { Table, TableStatus } from "@/generated/prisma";

type TableWithSession = Table & {
  activeSession: {
    guestName: string;
    pax: number;
    since: Date;
  } | null;
};

export default function WaiterDashboard({
  tables
}: {
  tables: TableWithSession[];
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(tableId: string, currentStatus: TableStatus) {
    let nextStatus: TableStatus = "DISPONIBLE";
    if (currentStatus === "DISPONIBLE") nextStatus = "OCUPADA";
    else if (currentStatus === "OCUPADA") nextStatus = "SUCIA";
    else if (currentStatus === "SUCIA") nextStatus = "DISPONIBLE";

    startTransition(() => {
      updateTableStatus(tableId, nextStatus);
    });
  }

  function handleCloseTable(tableId: string) {
    if (confirm("¿Estás seguro de que quieres cerrar la cuenta de esta mesa?")) {
      startTransition(() => {
        closeTable(tableId);
      });
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-10 flex items-center justify-between border-b border-wire pb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-[0.2em] text-light">Mapa de Mesas</h1>
          <p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-dim">
            Mesero • Punto de Venta
          </p>
        </div>
        <button className="flex items-center gap-2 border border-wire px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-dim hover:text-light">
          <Lock className="h-3 w-3" />
          Bloquear
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {tables.map(t => (
          <div key={t.id} className={`group relative flex flex-col items-center justify-between border aspect-square p-4 transition-all duration-300 ${
            t.status === "DISPONIBLE" ? "border-sage/40 bg-sage/5 hover:border-sage" : 
            t.status === "OCUPADA" ? "border-glow/40 bg-glow/5 hover:border-glow" : 
            "border-ember/40 bg-ember/5 hover:border-ember"
          }`}>
            <div className="flex w-full items-center justify-between">
               <span className={`text-[0.55rem] font-bold uppercase tracking-[0.2em] ${
                  t.status === "DISPONIBLE" ? "text-sage" : 
                  t.status === "OCUPADA" ? "text-glow" : "text-ember"
               }`}>
                 {t.status}
               </span>
               {t.activeSession && (
                 <div className="flex items-center gap-1 text-[0.6rem] text-dim">
                    <Users className="h-3 w-3" />
                    {t.activeSession.pax}
                 </div>
               )}
            </div>

            <div className="flex flex-col items-center gap-2 my-auto">
              <span className="font-serif text-4xl text-light">{t.number}</span>
              {t.activeSession && (
                <span className="text-[0.65rem] font-medium tracking-wider text-light/70 uppercase">
                  {t.activeSession.guestName}
                </span>
              )}
            </div>

            <div className="absolute inset-0 bg-canvas/90 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <button 
                  onClick={() => handleStatusChange(t.id, t.status)}
                  disabled={isPending}
                  className="flex items-center gap-2 border border-wire px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-light hover:bg-wire/30"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Cambiar Estatus
                </button>

                {t.status === "OCUPADA" && t.activeSession && (
                  <button 
                    onClick={() => handleCloseTable(t.id)}
                    disabled={isPending}
                    className="flex items-center gap-2 border border-wire px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-light hover:bg-wire/30"
                  >
                    <Receipt className="h-3 w-3" />
                    Cerrar Cuenta
                  </button>
                )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
