"use client";

import { motion } from "framer-motion";

export default function MesaCapacityPreview({
  capacity,
  reduceMotion,
  /** Escala visual (p. ej. 0.65 en barras compactas). */
  scale = 1,
}: {
  capacity: number;
  reduceMotion: boolean | null;
  scale?: number;
}) {
  const cap = Math.max(1, Math.min(capacity, 24));
  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 280, damping: 28 };
  const seatSpring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 22 };

  const w = Math.min(76 + cap * 7.5, 168) * scale;
  const h = Math.min(46 + cap * 3.8, 96) * scale;
  const pad = 36 * scale;
  const cw = w + pad * 2;
  const ch = h + pad * 2;
  const cx = cw / 2;
  const cy = ch / 2;
  const rx = w / 2 + 18 * scale;
  const ry = h / 2 + 18 * scale;
  const dot = Math.min(8, 6 + cap * 0.18) * scale;

  return (
    <div
      className="relative mx-auto shrink-0 select-none"
      style={{ width: cw, height: ch }}
      aria-hidden
    >
      <motion.div
        className="absolute overflow-hidden rounded-[1.35rem] border-2 border-gold/40 bg-[linear-gradient(155deg,rgba(201,160,84,0.18)_0%,rgba(15,15,15,0.92)_48%,rgba(0,0,0,0.55)_100%)] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-20px_40px_-24px_rgba(201,160,84,0.06)]"
        initial={false}
        animate={{ width: w, height: h }}
        style={{ left: pad, top: pad }}
        transition={spring}
      >
        <div
          className="pointer-events-none absolute inset-[10%] rounded-[1rem] border border-white/[0.07] bg-black/25"
          style={{ opacity: cap >= 8 ? 0.45 : 0.28 }}
        />
      </motion.div>
      {Array.from({ length: cap }).map((_, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / cap;
        const left = cx + Math.cos(angle) * rx - dot / 2;
        const top = cy + Math.sin(angle) * ry - dot / 2;
        return (
          <motion.span
            key={`${cap}-${i}`}
            initial={reduceMotion ? false : { scale: 0.65, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...seatSpring, delay: reduceMotion ? 0 : i * 0.015 }}
            className="absolute rounded-full border border-gold/50 bg-gradient-to-b from-gold/90 to-gold/40 shadow-[0_0_14px_rgba(201,160,84,0.45)]"
            style={{ width: dot, height: dot, left, top }}
          />
        );
      })}
    </div>
  );
}
