"use client";

import { useEffect, useState } from "react";
import { changeChainAdmin } from "@/actions/admin";
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

type ChangeAdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chainId: string | null;
  chainName?: string;
  onChanged?: () => void | Promise<void>;
};

export function ChangeAdminDialog({ open, onOpenChange, chainId, chainName, onChanged }: ChangeAdminDialogProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [saving, setSaving] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [result, setResult] = useState<{ email: string; tempPassword: string; name: string } | null>(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setResult(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chainId || !adminName.trim()) return;

    setSaving(true);
    try {
      const res = await changeChainAdmin(chainId, {
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim() || undefined,
        adminPassword: adminPassword.trim() || undefined,
      });
      if (res.success && res.credentials) {
        setResult(res.credentials);
        setStep("success");
        await onChanged?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  if (!chainId) return null;

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="bg-bg-card text-text-primary border-border-main ring-0 sm:max-w-[460px] gap-0 p-0 overflow-hidden">
        {step === "form" ? (
          <div className="flex flex-col gap-6 p-7">
            <DialogHeader className="items-center text-center gap-2">
              <DialogTitle className="font-serif text-[20px] font-bold tracking-tight text-text-primary leading-none">
                Cambiar Administrador
              </DialogTitle>
              <DialogDescription className="text-[11px] text-text-muted font-light leading-relaxed max-w-xs">
                {chainName ? `Reasigna el administrador principal de ${chainName}.` : "Reasigna el administrador principal de la cadena."}
                El admin anterior perderá acceso inmediatamente.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ca-name" className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                  Nombre del Nuevo Administrador *
                </Label>
                <Input
                  id="ca-name"
                  required
                  autoFocus
                  placeholder="Ej. Gustavo Fring"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ca-email" className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                  Correo del Administrador
                </Label>
                <Input
                  id="ca-email"
                  type="email"
                  placeholder="Dejar en blanco para autogenerar"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ca-password" className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                  Contraseña Temporal
                </Label>
                <Input
                  id="ca-password"
                  type="text"
                  placeholder="Dejar en blanco para autogenerar"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
                />
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
                  disabled={saving || !adminName.trim()}
                  className="flex-1 bg-gold border-gold text-bg-solid hover:opacity-90 disabled:opacity-50 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
                >
                  {saving ? "Reasignando..." : "Confirmar Cambio"}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-7">
            <DialogHeader className="items-center text-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1">
                <svg className="size-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <DialogTitle className="font-serif text-[20px] font-bold tracking-tight text-text-primary leading-none">
                Admin Reasignado
              </DialogTitle>
              <DialogDescription className="text-[11px] text-text-muted font-light leading-relaxed max-w-xs">
                El nuevo administrador ha sido configurado. El anterior ya no tiene acceso.
                Guarda estas credenciales — solo se muestran una vez.
              </DialogDescription>
            </DialogHeader>

            {result && (
              <div className="flex flex-col gap-3 rounded-xl border border-border-main bg-bg-solid p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">Nombre</p>
                    <p className="text-[13px] font-medium text-text-primary truncate">{result.name}</p>
                  </div>
                </div>

                <Separator className="bg-border-main/50" />

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">Correo</p>
                    <p className="text-[13px] font-mono text-text-primary truncate">{result.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.email)}
                    className="shrink-0 rounded-md border border-border-main bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-text-dim hover:text-text-primary hover:border-border-bright transition-colors"
                  >
                    Copiar
                  </button>
                </div>

                <Separator className="bg-border-main/50" />

                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">Contraseña Temporal</p>
                    <p className="text-[13px] font-mono text-gold truncate">{result.tempPassword}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.tempPassword)}
                    className="shrink-0 rounded-md border border-border-main bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-text-dim hover:text-text-primary hover:border-border-bright transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full bg-gold border-gold text-bg-solid hover:opacity-90 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
            >
              Entendido, cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
