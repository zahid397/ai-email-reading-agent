"use client";

import { useCallback, useEffect, useState } from "react";
import { POLL_SECONDS } from "@/lib/config";

export function useScanCountdown(onScan: () => Promise<void>) {
  const [countdown, setCountdown] = useState(POLL_SECONDS);
  const [isScanning, setIsScanning] = useState(false);

  const reset = useCallback(() => {
    setCountdown(POLL_SECONDS);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? prev : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (countdown !== 0) return;

    let cancelled = false;
    setIsScanning(true);

    onScan()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setCountdown(POLL_SECONDS);
          setIsScanning(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [countdown, onScan]);

  const mm = String(Math.floor(countdown / 60)).padStart(2, "0");
  const ss = String(countdown % 60).padStart(2, "0");

  return {
    countdown,
    countdownStr: `${mm}:${ss}`,
    isScanning,
    reset,
  };
}
