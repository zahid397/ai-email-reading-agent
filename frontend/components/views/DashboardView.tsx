"use client";

import { Bell } from "lucide-react";
import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";
import { SystemStatusBar } from "@/components/dashboard/SystemStatusBar";
import { EmailList } from "@/components/emails/EmailList";
import type { Email, Stats } from "@/lib/email";

export function DashboardView({
  important,
  stats,
  loading,
  error,
  countdownStr,
  isScanning,
  duplicatesPrevented,
  onForceRun,
  triggering,
}: {
  important?: Email[];
  stats?: Stats;
  loading: boolean;
  error: unknown;
  countdownStr: string;
  isScanning: boolean;
  duplicatesPrevented: number;
  onForceRun: () => void;
  triggering: boolean;
}) {
  return (
    <>
      <SystemStatusBar
        countdownStr={countdownStr}
        isScanning={isScanning}
        onForceRun={onForceRun}
        triggering={triggering}
      />

      <DashboardStatCards stats={stats} duplicatesPrevented={duplicatesPrevented} />

      <section className="mt-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-primary/15">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Important Email Notifications</h2>
                <p className="text-xs text-slate-400">
                  AI-classified alerts surfaced from your inbox scan
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-slate-800/80 px-3 py-1 text-xs font-medium text-slate-300">
              {important?.length ?? 0} notification{(important?.length ?? 0) !== 1 ? "s" : ""}
            </span>
          </div>

          <EmailList
            emails={important}
            loading={loading}
            error={error}
            emptyTitle="Inbox is clear. Waiting for important emails..."
            emptyDescription="The AI agent scans every 2 minutes. Important notifications will appear here automatically when detected."
            emptyIcon="sparkles"
          />
        </div>
      </section>
    </>
  );
}
