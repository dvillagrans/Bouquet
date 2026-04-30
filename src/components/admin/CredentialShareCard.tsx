"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CredentialShareCardProps {
  name: string;
  email: string;
  password: string;
  entityName?: string;
  onClose?: () => void;
}

export function CredentialShareCard({
  name,
  email,
  password,
  entityName,
  onClose,
}: CredentialShareCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const loginUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "https://bouquet.io/login";

  const plainText = `
🌸 Bouquet Ops — Acceso Administrativo
${entityName ? `\nCadena: ${entityName}` : ""}
\n👤 Nombre: ${name}
📧 Correo: ${email}
🔑 Contraseña temporal: ${password}
🌐 Login: ${loginUrl}
\nPor seguridad, cambia tu contraseña al iniciar sesión.
  `.trim();

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const share = async () => {
    const shareData = {
      title: "Bouquet Ops — Credenciales de Acceso",
      text: plainText,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      await copy(plainText, "todo");
    }
  };

  const openLogin = () => {
    window.open(loginUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Credential card */}
      <div className="flex flex-col gap-3 rounded-xl border border-border-main bg-bg-solid p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">Nombre</p>
            <p className="text-[13px] font-medium text-text-primary truncate">{name}</p>
          </div>
        </div>

        <Separator className="bg-border-main/50" />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">Correo</p>
            <p className="text-[13px] font-mono text-text-primary truncate">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => copy(email, "correo")}
            className="shrink-0 rounded-md border border-border-main bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-text-dim hover:text-text-primary hover:border-border-bright transition-colors"
          >
            {copied === "correo" ? "Copiado" : "Copiar"}
          </button>
        </div>

        <Separator className="bg-border-main/50" />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">Contraseña Temporal</p>
            <p className="text-[13px] font-mono text-gold truncate">{password}</p>
          </div>
          <button
            type="button"
            onClick={() => copy(password, "pass")}
            className="shrink-0 rounded-md border border-border-main bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-text-dim hover:text-text-primary hover:border-border-bright transition-colors"
          >
            {copied === "pass" ? "Copiado" : "Copiar"}
          </button>
        </div>

        <Separator className="bg-border-main/50" />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">URL de Acceso</p>
            <p className="text-[12px] font-mono text-text-dim truncate">{loginUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => copy(loginUrl, "url")}
            className="shrink-0 rounded-md border border-border-main bg-bg-card px-2.5 py-1.5 text-[11px] font-medium text-text-dim hover:text-text-primary hover:border-border-bright transition-colors"
          >
            {copied === "url" ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => copy(plainText, "todo")}
            className="flex-1 border-border-main bg-bg-solid text-text-primary hover:bg-bg-hover hover:text-text-secondary"
          >
            <svg className="size-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184m-9.39.924l-.008.008A12.228 12.228 0 012.25 12c0 5.942 4.276 10.89 9.914 11.874.647.108 1.305.189 1.972.242m9.39-12.924l.008-.008A12.228 12.228 0 0121.75 12c0-5.942-4.276-10.89-9.914-11.874a16.51 16.51 0 00-1.972-.242" />
            </svg>
            {copied === "todo" ? "Copiado" : "Copiar todo"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={share}
            className="flex-1 border-border-main bg-bg-solid text-text-primary hover:bg-bg-hover hover:text-text-secondary"
          >
            <svg className="size-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093m0 0L3.093 8.344m3.124 3.437c.18.324.287.696.287 1.093m0-1.093c-.18.324-.287.696-.287 1.093m0 0l3.124 3.437m0 0a2.25 2.25 0 100-2.186m0 2.186c.18-.324.287-.696.287-1.093m0 1.093c-.18-.324-.287-.696-.287-1.093m0 0L3.093 15.656m3.124-3.437c.18-.324.287-.696.287-1.093m0 1.093c-.18-.324-.287-.696-.287-1.093m0 0l3.124-3.437" />
            </svg>
            Compartir
          </Button>
        </div>

        <Button
          type="button"
          onClick={openLogin}
          className="w-full bg-gold border-gold text-bg-solid hover:opacity-90 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
        >
          <svg className="size-4 mr-1.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          Abrir página de login
        </Button>

        {onClose && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full text-text-dim hover:text-text-primary"
          >
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
}
