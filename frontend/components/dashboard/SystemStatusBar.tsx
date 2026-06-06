"use client";

import { Activity, Clock, RefreshCw, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemStatusBar({
  countdownStr,
  isScanning,
  onForceRun,
  triggering,
}: {
  countdownStr: string;
  isScanning: boolean;
  onForceRun: () => void;
  triggering: boolean;
}) {
  const active = isScanning || triggering;

  return (
    <section className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_0_40px_rgba(99,102,241,0.08)] backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10",
              active ? "bg-primary/20 text-primary" : "bg-emerald-500/15 text-emerald-400"
            )}
          >
            {active ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Activity className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white">System Status</h2>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Agent Active
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-400">
              Scheduler polls inbox every 2 minutes · auto-refreshes dashboard at 00:00
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-2">
                <Clock className="h-4 w-4 text-sky-400" />
                <span className="text-xs text-slate-400">Next Inbox Scan in:</span>
                <span
                  className={cn(
                    "font-mono text-lg font-bold tabular-nums tracking-wider",
                    countdownStr === "00:00" || isScanning
                      ? "text-primary animate-pulse"
                      : "text-white"
                  )}
                >
                  {isScanning ? "SCANNING" : countdownStr}
                </span>
              </div>

              {isScanning && (
                <span className="text-xs text-sky-300/80 animate-pulse">
                  Fetching /emails &amp; /stats…
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onForceRun}
          disabled={triggering || isScanning}
          className={cn(
            "flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/40",
            "bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground",
            "shadow-lg shadow-primary/20 transition-all hover:shadow-primary/35",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {triggering ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running Agent…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Force Run Agent
            </>
          )}
        </button>
      </div>
    </section>
  );
}
