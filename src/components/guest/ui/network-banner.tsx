"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import type { NetworkStatus } from "@/hooks/useNetworkStatus";

interface NetworkBannerProps {
  status: NetworkStatus;
}

const CONFIG = {
  offline: {
    icon: WifiOff,
    label: "Sin conexión",
    sub: "Tu orden no se puede enviar",
    bg: "rgba(180,50,30,0.10)",
    border: "rgba(180,50,30,0.22)",
    text: "var(--guest-urgent, #b43222)",
    dot: "#e05540",
  },
  slow: {
    icon: Wifi,
    label: "Señal débil",
    sub: "El envío puede tardar",
    bg: "rgba(180,130,20,0.10)",
    border: "rgba(180,130,20,0.22)",
    text: "var(--guest-gold)",
    dot: "var(--guest-gold)",
  },
} as const;

export function NetworkBanner({ status }: NetworkBannerProps) {
  const reduceMotion = useReducedMotion();
  const visible = status !== "online";
  const cfg = visible ? CONFIG[status] : null;

  return (
    <AnimatePresence>
      {visible && cfg && (
        <motion.div
          key={status}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="sticky top-0 z-40 flex items-center justify-center px-4 py-2"
          style={{ background: cfg.bg }}
        >
          {/* hairline border bottom */}
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
            style={{ background: cfg.border }}
            aria-hidden
          />

          <div className="flex items-center gap-2.5">
            {/* Pulsing dot */}
            <span className="relative flex size-2 shrink-0">
              <span
                className="absolute inline-flex size-full animate-ping rounded-full opacity-60"
                style={{ backgroundColor: cfg.dot }}
              />
              <span
                className="relative inline-flex size-2 rounded-full"
                style={{ backgroundColor: cfg.dot }}
              />
            </span>

            <cfg.icon
              className="size-3.5 shrink-0"
              style={{ color: cfg.text }}
              strokeWidth={2}
              aria-hidden
            />

            <span
              className="text-[11px] font-semibold leading-none"
              style={{ color: cfg.text }}
            >
              {cfg.label}
            </span>

            <span
              className="hidden text-[11px] leading-none opacity-70 sm:inline"
              style={{ color: cfg.text }}
            >
              · {cfg.sub}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
