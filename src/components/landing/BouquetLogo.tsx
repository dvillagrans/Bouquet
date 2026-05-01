"use client";

import { motion } from "framer-motion";

interface BouquetLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  variant?: "light" | "dark";
}

const sizes = {
  sm: { text: "text-[1.25rem]", icon: 28, tagline: "text-[0.45rem]" },
  md: { text: "text-[1.55rem]", icon: 32, tagline: "text-[0.5rem]" },
  lg: { text: "text-[2.25rem]", icon: 40, tagline: "text-[0.6rem]" },
  xl: { text: "text-[3.5rem]", icon: 56, tagline: "text-[0.75rem]" },
};

export function BouquetLogo({
  className = "",
  size = "md",
  showTagline = false,
  variant = "dark",
}: BouquetLogoProps) {
  const s = sizes[size];
  const textColor = variant === "dark" ? "text-burgundy" : "text-white";
  const taglineColor = variant === "dark" ? "text-burgundy/60" : "text-white/60";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icono "b" con flor */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Tallo y hojas */}
        <motion.path
          d="M24 38C24 38 22 32 20 28C18 24 14 22 14 22"
          stroke={variant === "dark" ? "#8A9A84" : "#A8B0A0"}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <motion.path
          d="M24 38C24 38 26 33 28 30C30 27 34 26 34 26"
          stroke={variant === "dark" ? "#8A9A84" : "#A8B0A0"}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
        />
        {/* Hoja izquierda */}
        <motion.path
          d="M20 28C18 26 16 27 15 29C14 31 16 33 18 32C20 31 20 28 20 28Z"
          fill={variant === "dark" ? "#A8B0A0" : "#C5CCC2"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />
        {/* Hoja derecha */}
        <motion.path
          d="M28 30C30 28 32 29 33 31C34 33 32 35 30 34C28 33 28 30 28 30Z"
          fill={variant === "dark" ? "#8A9A84" : "#A8B0A0"}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        />
        {/* Flor rosa */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
        >
          <circle cx="24" cy="18" r="5" fill="#C75B7A" />
          <circle cx="20" cy="16" r="4" fill="#D68C9F" />
          <circle cx="28" cy="16" r="4" fill="#E8A5B0" />
          <circle cx="22" cy="21" r="3.5" fill="#D68C9F" />
          <circle cx="26" cy="21" r="3.5" fill="#C75B7A" />
          <circle cx="24" cy="18" r="2.5" fill="#F5D5DC" />
        </motion.g>
        {/* Letra "b" estilizada */}
        <motion.path
          d="M14 8V32C14 36 17 39 21 39H27"
          stroke={variant === "dark" ? "#4A1A2C" : "#F5E6EB"}
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.1 }}
        />
        <motion.path
          d="M14 20H22C25 20 27 22 27 25C27 28 25 30 22 30H14"
          stroke={variant === "dark" ? "#4A1A2C" : "#F5E6EB"}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
      </svg>

      <div className="flex flex-col">
        <span
          className={`font-serif ${s.text} font-semibold italic tracking-tight ${textColor}`}
        >
          bouquet
        </span>
        {showTagline && (
          <span className={`${s.tagline} font-bold uppercase tracking-[0.3em] ${taglineColor}`}>
            crea tu
          </span>
        )}
      </div>
    </div>
  );
}
