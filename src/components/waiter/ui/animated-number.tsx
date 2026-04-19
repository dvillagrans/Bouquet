"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedNumber({
  value,
  className = "",
  format,
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const reduceMotion = useReducedMotion();
  const text = format ? format(value) : String(value);

  if (reduceMotion) {
    return <span className={`tabular-nums font-mono ${className}`}>{text}</span>;
  }

  return (
    <motion.span
      key={text}
      className={`tabular-nums font-mono ${className}`}
      initial={{ opacity: 0.65, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      {text}
    </motion.span>
  );
}
