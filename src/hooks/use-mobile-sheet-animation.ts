"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * Animate a mobile sheet (slide-in from left) and its backdrop.
 * Uses GSAP with automatic cleanup via gsap.context().
 * Respects prefers-reduced-motion.
 */
export function useMobileSheetAnimation(
  sheetRef: React.RefObject<HTMLElement | null>,
  backdropRef: React.RefObject<HTMLElement | null>,
  open: boolean
): void {
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useGSAP(
    () => {
      const sheet = sheetRef.current;
      if (!sheet) return;

      const prefersReduced = reducedMotionRef.current;

      if (prefersReduced) {
        gsap.set(sheet, { x: open ? "0%" : "-100%" });
        if (backdropRef.current) {
          gsap.set(backdropRef.current, { opacity: open ? 1 : 0 });
        }
        return;
      }

      if (open) {
        gsap.fromTo(
          sheet,
          { x: "-100%" },
          { x: "0%", duration: 0.35, ease: "power2.out" }
        );
        if (backdropRef.current) {
          gsap.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        }
      } else {
        gsap.to(sheet, {
          x: "-100%",
          duration: 0.25,
          ease: "power2.in",
        });
        if (backdropRef.current) {
          gsap.to(backdropRef.current, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
          });
        }
      }
    },
    { dependencies: [open], scope: sheetRef }
  );
}
