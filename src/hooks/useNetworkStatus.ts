"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type NetworkStatus = "online" | "offline" | "slow";

const PING_URL = "/favicon.ico";
const PING_TIMEOUT_MS = 4000;
const SLOW_THRESHOLD_MS = 2500;
const PING_INTERVAL_MS = 30_000;

async function checkConnection(): Promise<NetworkStatus> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  const start = Date.now();

  try {
    await fetch(`${PING_URL}?_t=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
      signal: controller.signal,
    });
    return Date.now() - start > SLOW_THRESHOLD_MS ? "slow" : "online";
  } catch {
    return typeof navigator !== "undefined" && navigator.onLine ? "slow" : "offline";
  } finally {
    clearTimeout(timeoutId);
  }
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>("online");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = useCallback(async () => {
    setStatus(await checkConnection());
  }, []);

  useEffect(() => {
    void ping();

    const handleOffline = () => setStatus("offline");
    const handleOnline = () => void ping();

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    intervalRef.current = setInterval(() => void ping(), PING_INTERVAL_MS);

    // Network Information API — Android Chrome only, degrades gracefully elsewhere
    const conn = (navigator as Navigator & { connection?: EventTarget & { effectiveType?: string } }).connection;
    const handleConnectionChange = () => {
      const type = conn?.effectiveType;
      if (type === "slow-2g" || type === "2g") {
        setStatus("slow");
      } else if (type === "3g" || type === "4g") {
        void ping();
      }
    };
    conn?.addEventListener("change", handleConnectionChange);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (intervalRef.current) clearInterval(intervalRef.current);
      conn?.removeEventListener("change", handleConnectionChange);
    };
  }, [ping]);

  return status;
}
