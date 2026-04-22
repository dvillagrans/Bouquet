"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

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
  onAddToCart?: (items: AssistantAddToCartItem[]) => void;
  liftFabForBottomBar?: boolean;
};

export type AssistantAddToCartItem = {
  name: string;
  quantity: number;
};

/* ── Rotating loading phrases ──────────────────────────────────── */
const LOADING_PHRASES = [
  "Revisando la carta…",
  "Buscando lo mejor para ti…",
  "Analizando tus preferencias…",
  "Pensando recomendación…",
];

/* ── Spring configs ───────────────────────────────────────────── */
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 320, damping: 26 };
const SPRING_PANEL = { type: "spring" as const, stiffness: 260, damping: 24 };

/* ── Helpers ──────────────────────────────────────────────────── */

function extractText(message: any): string {
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.parts)) {
    return message.parts
      .filter((p: any) => p?.type === "text" && typeof p?.text === "string")
      .map((p: any) => p.text)
      .join("\n");
  }
  return "";
}

function renderInlineAssistantMarkdown(text: string): ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\$\s?\d[\d,.]*(?:\s?MXN)?)/g);
  return tokens.map((token, index) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={`md-${index}`} className="font-semibold text-[color-mix(in_srgb,var(--guest-text)_92%,black)]">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return (
        <em key={`md-${index}`} className="italic text-[color-mix(in_srgb,var(--guest-text)_88%,black)]">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith("`") && token.endsWith("`") && token.length > 2) {
      return (
        <code
          key={`md-${index}`}
          className="rounded bg-[color-mix(in_srgb,var(--guest-gold)_14%,transparent)] px-1 py-0.5 font-mono text-[0.92em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (/^\$\s?\d[\d,.]*(?:\s?MXN)?$/.test(token.trim())) {
      return (
        <span
          key={`md-${index}`}
          className="font-semibold text-[var(--guest-gold)]"
        >
          {token}
        </span>
      );
    }
    return <Fragment key={`md-${index}`}>{token}</Fragment>;
  });
}

function renderAssistantMessage(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = text.split("\n");

  let paragraphLines: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const paragraphIndex = nodes.length;
    nodes.push(
      <p key={`p-${paragraphIndex}`} className="leading-[1.65]">
        {paragraphLines.map((line, lineIndex) => (
          <Fragment key={`l-${paragraphIndex}-${lineIndex}`}>
            {renderInlineAssistantMarkdown(line)}
            {lineIndex < paragraphLines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </p>,
    );
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    const listIndex = nodes.length;
    const commonClassName = "ml-4 space-y-1 text-[13.5px] leading-[1.6]";
    nodes.push(
      listType === "ul" ? (
        <ul key={`ul-${listIndex}`} className={`list-disc ${commonClassName}`}>
          {listItems.map((item, itemIndex) => (
            <li key={`li-${listIndex}-${itemIndex}`}>{renderInlineAssistantMarkdown(item)}</li>
          ))}
        </ul>
      ) : (
        <ol key={`ol-${listIndex}`} className={`list-decimal ${commonClassName}`}>
          {listItems.map((item, itemIndex) => (
            <li key={`li-${listIndex}-${itemIndex}`}>{renderInlineAssistantMarkdown(item)}</li>
          ))}
        </ol>
      ),
    );
    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+[\.)]\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  return nodes;
}

function parseAssistantActions(rawText: string): {
  cleanText: string;
  addToCartItems: AssistantAddToCartItem[];
} {
  const actionPattern = /\[\[BOUQUET_ACTION:([\s\S]*?)\]\]/g;
  const addToCartItems: AssistantAddToCartItem[] = [];

  const cleanText = rawText.replace(actionPattern, (_full, payload) => {
    try {
      const parsed = JSON.parse(String(payload).trim()) as {
        type?: unknown;
        items?: Array<{ name?: unknown; quantity?: unknown }>;
      };

      if (parsed.type !== "add_to_cart" || !Array.isArray(parsed.items)) {
        return "";
      }

      for (const item of parsed.items) {
        const name = typeof item?.name === "string" ? item.name.trim() : "";
        const rawQty = Number(item?.quantity);
        const quantity = Number.isFinite(rawQty)
          ? Math.max(1, Math.min(20, Math.trunc(rawQty)))
          : 1;
        if (!name) continue;
        addToCartItems.push({ name, quantity });
      }
    } catch {
      /* noop */
    }
    return "";
  });

  return { cleanText: cleanText.trim(), addToCartItems };
}

/** Tiny inline avatar for AI messages */
function AiBadge() {
  return (
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--guest-halo)] to-[color-mix(in_srgb,var(--guest-gold)_14%,transparent)] text-[var(--guest-gold)] shadow-[0_1px_4px_rgba(183,146,93,0.18)]">
      <Sparkles className="h-3 w-3" aria-hidden />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */

export function GuestMenuAIAssistant({
  restaurantName,
  tableCode,
  menuItems,
  disabled = false,
  onAddToCart,
  liftFabForBottomBar = false,
}: GuestMenuAIAssistantProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const [loadingPhrase, setLoadingPhrase] = useState(0);
  const listEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedActionMessagesRef = useRef<Set<string>>(new Set());

  const context = useMemo(
    () => ({ restaurantName, tableCode, items: menuItems }),
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

  /* Rotate loading phrases */
  useEffect(() => {
    if (!isLoading) return;
    const iv = setInterval(
      () => setLoadingPhrase((p) => (p + 1) % LOADING_PHRASES.length),
      2200,
    );
    return () => clearInterval(iv);
  }, [isLoading]);

  /* Auto-focus input on open */
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = composer.trim();
    if (!text || typeof sendMessage !== "function") return;
    await sendMessage({ text });
    setComposer("");
  }

  /* Auto-scroll */
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [safeMessages, isLoading]);

  useEffect(() => {
    if (!onAddToCart) return;

    safeMessages.forEach((message: any, index: number) => {
      if (message?.role !== "assistant") return;

      const messageKey = String(message?.id ?? `idx-${index}`);
      if (processedActionMessagesRef.current.has(messageKey)) return;

      const rawText = extractText(message);
      const { addToCartItems } = parseAssistantActions(rawText);
      if (addToCartItems.length === 0) return;

      processedActionMessagesRef.current.add(messageKey);
      onAddToCart(addToCartItems);
    });
  }, [safeMessages, onAddToCart]);

  if (disabled) return null;

  /* ── Suggestion prompts ──────────────────────────────────────── */
  const suggestions = [
    { short: "Algo ligero", full: "Quiero algo ligero y no picante por menos de $200" },
    { short: "Para compartir", full: "Dame 3 opciones para compartir entre 2 personas" },
    { short: "Lo popular", full: "Recomiéndame algo popular y rápido de preparar" },
  ];

  return (
    <>
      {/* ━━ FAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={reducedMotion ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reducedMotion ? {} : { scale: 0.85, opacity: 0 }}
            whileHover={reducedMotion ? {} : { y: -2, scale: 1.04 }}
            whileTap={reducedMotion ? {} : { scale: 0.96 }}
            transition={SPRING_SNAPPY}
            onClick={() => setOpen(true)}
            className={`fixed right-4 z-[90] flex size-[54px] items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_48%,transparent)] bg-[color-mix(in_srgb,var(--guest-bg-surface)_92%,white)] shadow-[0_8px_32px_rgba(183,146,93,0.18),0_16px_40px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:right-6 ${liftFabForBottomBar ? "bottom-24" : "bottom-6"}`}
            style={{ WebkitBackfaceVisibility: "hidden" }}
            aria-label="Abrir asistente AI del menú"
          >
            <span className="pointer-events-none absolute inset-[1px] rounded-full border border-white/30" aria-hidden />
            <span
              className="pointer-events-none absolute -inset-1 -z-10 rounded-full opacity-40 blur-lg"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--guest-gold) 30%, transparent), transparent 72%)" }}
              aria-hidden
            />
            <Sparkles className="size-[22px] text-[var(--guest-gold)]" aria-hidden />
            
            {/* Notification Badge */}
            <motion.span
              className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-[var(--guest-bg-surface)] bg-emerald-500"
              animate={reducedMotion ? {} : { opacity: [0.6, 1, 0.6], scale: [1, 1.15, 1] }}
              transition={reducedMotion ? {} : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ━━ Panel ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {open && (
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? {} : { opacity: 0, y: 16, scale: 0.97 }}
            transition={SPRING_PANEL}
            className="fixed bottom-4 right-3 z-[100] flex h-[min(76dvh,600px)] w-[min(94vw,400px)] flex-col overflow-hidden rounded-[26px] border border-[color-mix(in_srgb,var(--guest-gold)_22%,var(--guest-divider))] bg-[color-mix(in_srgb,var(--guest-bg-surface)_94%,white)] shadow-[0_32px_80px_rgba(15,23,42,0.22),0_8px_24px_rgba(183,146,93,0.08)] backdrop-blur-2xl sm:bottom-6 sm:right-6"
            aria-label="Asistente AI del menú"
          >
            {/* Top glow */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-28"
              style={{ background: "radial-gradient(ellipse 72% 100% at 50% -8%, color-mix(in srgb, var(--guest-gold) 22%, transparent), transparent)" }}
            />

            {/* ── Header ────────────────────────────────────────── */}
            <header className="relative flex items-center justify-between border-b border-[var(--guest-divider)] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_32%,transparent)] bg-gradient-to-br from-[var(--guest-halo)] to-[color-mix(in_srgb,var(--guest-gold)_10%,transparent)] text-[var(--guest-gold)] shadow-[0_2px_8px_rgba(183,146,93,0.16),inset_0_1px_0_rgba(255,255,255,0.3)]">
                  <Bot className="h-[18px] w-[18px]" aria-hidden />
                </div>
                <div>
                  <p className="text-[13px] font-bold tracking-tight text-[var(--guest-text)]">Bouquet AI</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--guest-muted)]">Recomendaciones del menú</p>
                </div>
              </div>
              <div className="mr-2 hidden items-center gap-1.5 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--guest-muted)] sm:inline-flex">
                <span className="guest-status-dot-pulse h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                En vivo
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full text-[var(--guest-muted)] transition-colors duration-150 hover:bg-[var(--guest-bg-surface-2)] hover:text-[var(--guest-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--guest-gold)]"
                aria-label="Cerrar asistente AI"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            {/* ── Messages ──────────────────────────────────────── */}
            <div className="relative flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
              <div className="space-y-5">
                {/* ─ Welcome / Empty state ─ */}
                {safeMessages.length === 0 && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                    className="space-y-4"
                  >
                    {/* Welcome bubble (styled as AI message) */}
                    <div className="flex items-end gap-2">
                      <AiBadge />
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-[color-mix(in_srgb,var(--guest-gold)_14%,var(--guest-divider))] bg-[var(--guest-bg-surface-2)] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <p className="text-[13px] font-semibold leading-snug text-[var(--guest-text)]">
                          ¡Hola! 👋 Soy tu asistente del menú
                        </p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--guest-muted)]">
                          Cuéntame qué se te antoja, tu presupuesto o restricciones y te doy opciones concretas.
                        </p>
                      </div>
                    </div>

                    {/* Suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 pl-8">
                      {suggestions.map((s, i) => (
                        <motion.button
                          key={s.short}
                          type="button"
                          initial={reducedMotion ? false : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={reducedMotion ? {} : { delay: 0.15 + i * 0.07, duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                          onClick={() => {
                            setComposer(s.full);
                            inputRef.current?.focus();
                          }}
                          className="rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_25%,var(--guest-divider))] bg-[color-mix(in_srgb,var(--guest-bg-surface)_90%,white)] px-3 py-1.5 text-[11px] font-semibold text-[var(--guest-gold)] transition-all duration-200 hover:border-[color-mix(in_srgb,var(--guest-gold)_50%,transparent)] hover:bg-[var(--guest-halo)] hover:shadow-[0_2px_8px_rgba(183,146,93,0.12)] active:scale-[0.97]"
                        >
                          {s.short}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ─ Conversation ─ */}
                {safeMessages.map((message: any, index: number) => {
                  const isUser = message.role === "user";
                  const rawText = extractText(message);
                  const text = isUser ? rawText : parseAssistantActions(rawText).cleanText;
                  if (!text) return null;

                  return (
                    <motion.div
                      key={message.id}
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={reducedMotion ? {} : { duration: 0.24, delay: Math.min(index * 0.03, 0.12), ease: [0.25, 1, 0.5, 1] }}
                    >
                      {isUser ? (
                        /* ── USER MESSAGE ──────────────────────── */
                        <div className="flex justify-end pl-10">
                          <div className="relative max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-br from-[var(--guest-gold)] to-[color-mix(in_srgb,var(--guest-gold)_82%,#7a5c3e)] px-4 py-2.5 shadow-[0_2px_12px_rgba(183,146,93,0.28),inset_0_1px_0_rgba(255,255,255,0.15)]">
                            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-white/95">
                              {text}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* ── AI MESSAGE ─────────────────────────── */
                        <div className="flex items-end gap-2 pr-6">
                          <AiBadge />
                          <div className="relative max-w-[85%] rounded-2xl rounded-bl-sm border border-[color-mix(in_srgb,var(--guest-gold)_12%,var(--guest-divider))] bg-[var(--guest-bg-surface-2)] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                            {/* Subtle gold accent line on left */}
                            <div className="pointer-events-none absolute bottom-3 left-0 top-3 w-[2px] rounded-full bg-gradient-to-b from-[var(--guest-gold)] to-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)] opacity-40" />
                            <div className="space-y-2 text-[13.5px] text-[var(--guest-text)]">
                              {renderAssistantMessage(text)}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* ─ Loading indicator ─ */}
                {isLoading && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-end gap-2 pr-6"
                  >
                    <AiBadge />
                    <div className="inline-flex items-center gap-2.5 rounded-2xl rounded-bl-sm border border-[color-mix(in_srgb,var(--guest-gold)_12%,var(--guest-divider))] bg-[var(--guest-bg-surface-2)] px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      {/* Bouncing dots */}
                      <span className="inline-flex items-center gap-[3px]" aria-hidden>
                        {[0, 0.15, 0.3].map((delay) => (
                          <motion.span
                            key={delay}
                            className="h-[5px] w-[5px] rounded-full bg-[var(--guest-gold)]"
                            animate={reducedMotion ? {} : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={reducedMotion ? {} : { duration: 1, repeat: Infinity, delay, ease: "easeInOut" }}
                          />
                        ))}
                      </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={loadingPhrase}
                          initial={reducedMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reducedMotion ? {} : { opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[12px] text-[var(--guest-muted)]"
                        >
                          {LOADING_PHRASES[loadingPhrase]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* ─ Error ─ */}
                {error && (
                  <motion.div
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-8 rounded-xl border border-[color-mix(in_srgb,var(--guest-urgent)_30%,transparent)] bg-[color-mix(in_srgb,var(--guest-urgent)_6%,transparent)] px-4 py-2.5 text-[12px] leading-relaxed text-[var(--guest-urgent)]"
                  >
                    No pude responder. Verifica la configuración de API keys del asistente.
                  </motion.div>
                )}

                <div ref={listEndRef} />
              </div>
            </div>

            {/* ── Composer ──────────────────────────────────────── */}
            <div className="relative">
              {/* Frosted separator gradient */}
              <div
                className="pointer-events-none absolute inset-x-0 -top-px h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 5%, color-mix(in srgb, var(--guest-gold) 20%, var(--guest-divider)) 50%, transparent 95%)",
                }}
              />

              <form
                onSubmit={onSubmit}
                className="relative bg-gradient-to-b from-[color-mix(in_srgb,var(--guest-bg-surface)_97%,white)] to-[var(--guest-bg-surface)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
              >
                {/* Input row */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                      placeholder="Escribe tu pregunta…"
                      className="min-h-[44px] w-full rounded-2xl border border-[color-mix(in_srgb,var(--guest-gold)_16%,var(--guest-divider))] bg-[var(--guest-bg-surface-2)] px-4 pr-3 text-[13.5px] text-[var(--guest-text)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] outline-none transition-all duration-200 placeholder:text-[var(--guest-subtle)] focus:border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.04),0_0_0_3px_color-mix(in_srgb,var(--guest-gold)_10%,transparent)]"
                      disabled={isLoading}
                      aria-label="Escribir mensaje al asistente"
                    />
                  </div>

                  {/* Send button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !composer.trim()}
                    whileTap={reducedMotion ? {} : { scale: 0.88 }}
                    animate={
                      composer.trim()
                        ? { opacity: 1, scale: 1 }
                        : { opacity: 0.5, scale: 0.95 }
                    }
                    transition={{ duration: 0.15 }}
                    className="inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--guest-gold)] to-[color-mix(in_srgb,var(--guest-gold)_78%,#6b4f30)] text-white shadow-[0_3px_10px_rgba(183,146,93,0.3),inset_0_1px_0_rgba(255,255,255,0.18)] transition-shadow duration-150 hover:shadow-[0_4px_18px_rgba(183,146,93,0.4)] disabled:cursor-not-allowed disabled:shadow-none"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="h-[15px] w-[15px]" strokeWidth={2.5} aria-hidden />
                  </motion.button>
                </div>

                {/* Quick chips row */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--guest-subtle)]">
                    Prueba:
                  </span>
                  {[
                    { label: "Bajo presupuesto", prompt: "Dame 3 opciones por menos de $200 MXN" },
                    { label: "Ligero", prompt: "Quiero algo rápido y ligero" },
                    { label: "Para compartir", prompt: "Quiero algo para compartir entre 2" },
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setComposer(chip.prompt);
                        inputRef.current?.focus();
                      }}
                      className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--guest-gold)_18%,var(--guest-divider))] px-2.5 py-1 text-[10px] font-semibold text-[var(--guest-muted)] transition-all duration-150 hover:border-[color-mix(in_srgb,var(--guest-gold)_40%,transparent)] hover:bg-[var(--guest-halo)] hover:text-[var(--guest-gold)] active:scale-[0.97]"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
