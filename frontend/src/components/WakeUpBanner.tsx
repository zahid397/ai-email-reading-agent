"use client";

import { useEffect, useState } from "react";
import { Loader2, Wifi, WifiOff, RefreshCw } from "lucide-react";

interface WakeUpBannerProps {
  attempt: number;
  maxAttempts: number;
  onRetryNow: () => void;
}

export function WakeUpBanner({
  attempt,
  maxAttempts,
  onRetryNow,
}: WakeUpBannerProps) {
  const [elapsed, setElapsed] = useState(0);

  // Tick elapsed seconds so user sees time passing
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const progress = Math.min((attempt / maxAttempts) * 100, 100);
  const isGivingUp = attempt >= maxAttempts;

  if (isGivingUp) {
    return (
      <div className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <WifiOff className="h-5 w-5 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">
              Backend unreachable after {elapsed}s
            </p>
            <p className="text-xs text-red-600 mt-1">
              The Render backend may be down or taking longer than usual.
              Check your Render dashboard, then retry.
            </p>
            <button
              onClick={onRetryNow}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-6 mt-4 rounded-xl border border-orange-200 bg-orange-50 p-5">
      <div className="flex items-start gap-4">
        {/* Animated icon */}
        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 relative">
          <Wifi className="h-5 w-5 text-orange-500" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-400 pulse-dot" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-orange-500 spin-slow" />
            <p className="text-sm font-semibold text-orange-800">
              Waking up backend…
            </p>
          </div>

          <p className="text-xs text-orange-700 mt-1">
            Render free tier sleeps after 15 min of inactivity.
            Auto-reconnecting — usually takes{" "}
            <span className="font-semibold">30–60 seconds</span>.
          </p>

          {/* Progress bar */}
          <div className="mt-3 w-full bg-orange-200 rounded-full h-1.5">
            <div
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stats row */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-orange-600">
            <span>
              Attempt{" "}
              <span className="font-semibold">{attempt}</span> of{" "}
              {maxAttempts}
            </span>
            <span>
              Elapsed{" "}
              <span className="font-semibold font-mono">{elapsed}s</span>
            </span>
            <button
              onClick={onRetryNow}
              className="underline hover:no-underline font-medium"
            >
              Retry now
            </button>
          </div>

          {/* Step hints */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              "Sending wake ping",
              "Waiting for Render to spin up",
              "Loading database",
              "Starting scheduler",
            ].map((step, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all duration-500
                  ${
                    attempt > i * 3
                      ? "bg-orange-200 text-orange-700"
                      : "bg-orange-100 text-orange-400"
                  }`}
              >
                {attempt > i * 3 + 3 ? (
                  <span className="text-green-600">✓</span>
                ) : attempt > i * 3 ? (
                  <Loader2 className="h-3 w-3 spin-slow" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current inline-block" />
                )}
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
