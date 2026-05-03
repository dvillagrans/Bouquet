"use client";

import { useEffect } from "react";

export function LandingScrollbar() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.add("custom-scrollbar");
    body.classList.add("custom-scrollbar");

    return () => {
      root.classList.remove("custom-scrollbar");
      body.classList.remove("custom-scrollbar");
    };
  }, []);

  return null;
}