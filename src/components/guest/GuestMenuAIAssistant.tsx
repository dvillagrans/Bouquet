"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type GuestMenuItemContext = {
  name: string;
  description?: string | null;
  categoryName?: string | null;
  price: number;
  isPopular?: boolean;
  isSoldOut?: boolean;
};

type GuestMenuAIAssistantProps = {
  restaurantName: string;
  tableCode: string;
  menuItems: GuestMenuItemContext[];
  disabled?: boolean;
};

export function GuestMenuAIAssistant({
  restaurantName,
  tableCode,
  menuItems,
  disabled = false,
}: GuestMenuAIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);

  const context = useMemo(
    () => ({
      restaurantName,
      tableCode,
      items: menuItems,
    }),
    [restaurantName, tableCode, menuItems],
  );

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/guest-menu-ai",
      body: { context },
    }),
  }) as any;

  const { messages, sendMessage, status, error } = chat;
  const safeMessages = Array.isArray(messages) ? messages : [];
  const isLoading = status === "submitted" || status === "streaming";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = composer.trim();
    if (!text || typeof sendMessage !== "function") return;
    await sendMessage({ text });
    setComposer("");
  }

  useEffect(() => {
    if (!listEndRef.current) return;
    listEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages, isLoading]);

  if (disabled) return null;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-4 z-[90] inline-flex min-h-12 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_40%,transparent)] bg-[var(--guest-bg-surface)] px-4 text-sm font-semibold text-[var(--guest-text)] shadow-[0_12px_36px_rgba(15,23,42,0.18)] backdrop-blur-sm transition-transform hover:scale-[1.02] sm:right-6"
            aria-label="Abrir asistente AI del menu"
          >
            <Sparkles className="h-4 w-4 text-[var(--guest-gold)]" aria-hidden />
            Bouquet AI
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-3 z-[100] flex h-[min(74dvh,560px)] w-[min(94vw,380px)] flex-col overflow-hidden rounded-3xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] shadow-[0_28px_70px_rgba(15,23,42,0.24)] sm:bottom-6 sm:right-6"
            aria-label="Asistente AI del menu"
          >
            <header className="flex items-center justify-between border-b border-[var(--guest-divider)] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-[var(--guest-halo)] p-2 text-[var(--guest-gold)]">
                  <Bot className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--guest-text)]">Bouquet AI</p>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--guest-muted)]">
                    Recomendaciones del menu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-[var(--guest-muted)] transition-colors hover:bg-[var(--guest-bg-surface-2)] hover:text-[var(--guest-text)]"
                aria-label="Cerrar asistente AI"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {safeMessages.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] p-4 text-sm text-[var(--guest-muted)]">
                  Te ayudo a elegir rapido. Ejemplo: "quiero algo ligero y no picante por menos de $200".
                </div>
              )}

              {safeMessages.map((message: any) => (
                <div key={message.id} className={message.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[86%] rounded-2xl rounded-br-md bg-[var(--guest-gold)] px-3 py-2 text-sm text-white"
                        : "max-w-[86%] rounded-2xl rounded-bl-md border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-3 py-2 text-sm text-[var(--guest-text)]"
                    }
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {typeof message.content === "string"
                        ? message.content
                        : Array.isArray(message.parts)
                          ? message.parts
                              .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
                              .map((p: any) => p.text)
                              .join("\n")
                          : ""}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-3 py-2 text-sm text-[var(--guest-muted)]">
                    Pensando recomendacion...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-[color-mix(in_srgb,var(--guest-urgent)_40%,transparent)] bg-[color-mix(in_srgb,var(--guest-urgent)_10%,transparent)] px-3 py-2 text-xs text-[var(--guest-urgent)]">
                  No pude responder. Verifica la configuracion de API keys del asistente.
                </div>
              )}
              <div ref={listEndRef} />
            </div>

            <form onSubmit={onSubmit} className="border-t border-[var(--guest-divider)] p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  placeholder="Ej. Quiero algo para compartir..."
                  className="min-h-11 flex-1 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-4 text-sm text-[var(--guest-text)] outline-none transition-colors placeholder:text-[var(--guest-muted)] focus:border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !composer.trim()}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--guest-gold)] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setComposer("Dame 3 opciones por menos de $200 MXN")}
                  className="rounded-full border border-[var(--guest-divider)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--guest-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] hover:text-[var(--guest-text)]"
                >
                  Bajo presupuesto
                </button>
                <button
                  type="button"
                  onClick={() => setComposer("Quiero algo rapido y ligero")}
                  className="rounded-full border border-[var(--guest-divider)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--guest-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] hover:text-[var(--guest-text)]"
                >
                  Rapido y ligero
                </button>
              </div>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
