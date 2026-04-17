"use client";

import { useEffect, useState } from "react";
import { createTenant } from "@/actions/admin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type CreateTenantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void | Promise<void>;
};

export function CreateTenantDialog({ open, onOpenChange, onCreated }: CreateTenantDialogProps) {
  const [creating, setCreating] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPin, setAdminPin] = useState("");

  useEffect(() => {
    if (open) {
      setNewTenantName("");
      setAdminName("");
      setAdminPin("");
    }
  }, [open]);

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTenantName.trim() || !adminName.trim() || !adminPin.trim()) return;

    setCreating(true);
    try {
      await createTenant({
        name: newTenantName.trim(),
        adminName: adminName.trim(),
        pin: adminPin.trim(),
      });
      onOpenChange(false);
      await onCreated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !creating && onOpenChange(next)}>
      <DialogContent className="bg-bg-card text-text-primary border-border-main ring-0 sm:max-w-[440px] gap-0 p-0 overflow-hidden">
        <div className="flex flex-col gap-6 p-7">
          <DialogHeader className="items-center text-center gap-2">
            <DialogTitle className="font-serif text-[22px] font-bold tracking-tight text-text-primary leading-none">
              Nuevo Client / Cadena
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-muted font-light leading-relaxed max-w-xs">
              Crea una nueva base y otorga su administrador principal para iniciar la implementación del restaurante.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTenant} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="tenant-name"
                className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
              >
                Denominación Comercial
              </Label>
              <Input
                id="tenant-name"
                required
                autoFocus
                placeholder="Ej. Grupo MIA"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
              />
            </div>

            <Separator className="bg-border-main/50" />

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="admin-name"
                className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
              >
                Alias Administrador
              </Label>
              <Input
                id="admin-name"
                required
                placeholder="Ej. Juan Pérez"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="admin-pin"
                className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
              >
                Código PIN Maestro
              </Label>
              <Input
                id="admin-pin"
                required
                placeholder="12345"
                pattern="\d{4,8}"
                title="De 4 a 8 números"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary font-mono placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
              />
              <p className="text-[10px] text-text-dim font-light">4 a 8 dígitos. Acceso maestro para el tenant.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={creating}
                onClick={() => onOpenChange(false)}
                className="flex-1 border-border-mid text-text-muted hover:text-text-secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={creating || !newTenantName.trim() || !adminName.trim() || !adminPin.trim()}
                className="flex-1 bg-gold border-gold text-bg-solid hover:opacity-90 disabled:opacity-50 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
              >
                {creating && (
                  <svg className="size-3.5 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {creating ? "Generando..." : "Lanzar Tenant SaaS"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
