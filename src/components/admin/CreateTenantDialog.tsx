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
import { CredentialShareCard } from "./CredentialShareCard";

type CreateTenantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void | Promise<void>;
};

export function CreateTenantDialog({ open, onOpenChange, onCreated }: CreateTenantDialogProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [creating, setCreating] = useState(false);

  // Form fields
  const [tenantName, setTenantName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [currency, setCurrency] = useState("MXN");

  // Result
  const [result, setResult] = useState<{
    chainId: string;
    email: string;
    tempPassword: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setStep("form");
      setTenantName("");
      setAdminName("");
      setAdminEmail("");
      setAdminPassword("");
      setCurrency("MXN");
      setResult(null);
    }
  }, [open]);

  const handleCreateTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantName.trim() || !adminName.trim()) return;

    setCreating(true);
    try {
      const res = await createTenant({
        name: tenantName.trim(),
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim() || undefined,
        adminPassword: adminPassword.trim() || undefined,
        currency,
      });
      if (res.success && res.credentials) {
        setResult({
          chainId: res.chainId,
          email: res.credentials.email,
          tempPassword: res.credentials.tempPassword,
          name: res.credentials.name,
        });
        setStep("success");
        await onCreated?.();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const canSubmit = tenantName.trim() && adminName.trim() && !creating;

  return (
    <Dialog open={open} onOpenChange={(next) => !creating && onOpenChange(next)}>
      <DialogContent className="bg-bg-card text-text-primary border-border-main ring-0 sm:max-w-[460px] gap-0 p-0 overflow-hidden">
        {step === "form" ? (
          <div className="flex flex-col gap-6 p-7">
            <DialogHeader className="items-center text-center gap-2">
              <DialogTitle className="font-serif text-[22px] font-bold tracking-tight text-text-primary leading-none">
                Nuevo Cliente / Cadena
              </DialogTitle>
              <DialogDescription className="text-[11px] text-text-muted font-light leading-relaxed max-w-xs">
                Crea una nueva cadena y asigna su administrador principal.
                Deja el correo y contraseña en blanco para autogenerarlos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateTenant} className="flex flex-col gap-4">
              {/* Cadena */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="tenant-name"
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
                >
                  Denominación Comercial *
                </Label>
                <Input
                  id="tenant-name"
                  required
                  autoFocus
                  placeholder="Ej. Grupo MIA"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
                />
              </div>

              <Separator className="bg-border-main/50" />

              {/* Admin */}
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="admin-name"
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
                >
                  Nombre del Administrador *
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
                  htmlFor="admin-email"
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
                >
                  Correo del Administrador
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="Dejar en blanco para autogenerar"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
                />
                <p className="text-[10px] text-text-dim/60">
                  Si lo dejas vacío se generará automáticamente.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="admin-password"
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
                >
                  Contraseña Temporal
                </Label>
                <Input
                  id="admin-password"
                  type="text"
                  placeholder="Dejar en blanco para autogenerar"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="h-10 bg-bg-solid border-border-bright text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/30"
                />
                <p className="text-[10px] text-text-dim/60">
                  Se generará una contraseña aleatoria si no la defines.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="currency"
                  className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim"
                >
                  Moneda Base
                </Label>
                <select
                  id="currency"
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
                  disabled={creating}
                  onClick={() => onOpenChange(false)}
                  className="flex-1 border-border-mid text-text-muted hover:text-text-secondary"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex-1 bg-gold border-gold text-bg-solid hover:opacity-90 disabled:opacity-50 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
                >
                  {creating && (
                    <svg className="size-3.5 animate-spin shrink-0 mr-1.5" viewBox="0 0 24 24" fill="none">
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
        ) : (
          <div className="flex flex-col gap-6 p-7">
            <DialogHeader className="items-center text-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1">
                <svg className="size-6 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <DialogTitle className="font-serif text-[22px] font-bold tracking-tight text-text-primary leading-none">
                Tenant Creado
              </DialogTitle>
              <DialogDescription className="text-[11px] text-text-muted font-light leading-relaxed max-w-xs">
                La cadena y su administrador han sido configurados exitosamente.
                Guarda estas credenciales — solo se muestran una vez.
              </DialogDescription>
            </DialogHeader>

            {result && (
              <CredentialShareCard
                name={result.name}
                email={result.email}
                password={result.tempPassword}
                entityName={tenantName}
                onClose={() => onOpenChange(false)}
              />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
