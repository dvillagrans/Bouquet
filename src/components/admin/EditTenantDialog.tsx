"use client";

import { useEffect, useState } from "react";
import { updateTenant } from "@/actions/admin";
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

type EditTenantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chain: { id: string; name: string; currency: string } | null;
  onUpdated?: () => void | Promise<void>;
};

export function EditTenantDialog({ open, onOpenChange, chain, onUpdated }: EditTenantDialogProps) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("MXN");

  useEffect(() => {
    if (open && chain) {
      setName(chain.name);
      setCurrency(chain.currency);
    }
  }, [open, chain]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chain || !name.trim()) return;

    setSaving(true);
    try {
      await updateTenant(chain.id, { name: name.trim(), currency });
      onOpenChange(false);
      await onUpdated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!chain) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="bg-bg-card text-text-primary border-border-main ring-0 sm:max-w-[420px] gap-0 p-0 overflow-hidden">
        <div className="flex flex-col gap-6 p-7">
          <DialogHeader className="items-center text-center gap-2">
            <DialogTitle className="font-serif text-[20px] font-bold tracking-tight text-text-primary leading-none">
              Editar Cadena
            </DialogTitle>
            <DialogDescription className="text-[11px] text-text-muted font-light leading-relaxed max-w-xs">
              Modifica los datos de la entidad B2B.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name" className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                Denominación Comercial
              </Label>
              <Input
                id="edit-name"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-currency" className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                Moneda Base
              </Label>
              <select
                id="edit-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 rounded-md border border-border-bright bg-bg-solid px-3 text-[12px] text-text-primary outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
              >
                <option value="MXN">MXN — Peso Mexicano</option>
                <option value="USD">USD — Dólar Estadounidense</option>
                <option value="EUR">EUR — Euro</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
                className="flex-1 border-border-mid text-text-muted hover:text-text-secondary"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex-1 bg-gold border-gold text-bg-solid hover:opacity-90 disabled:opacity-50 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
