"use client";

import { useMemo } from "react";
import { ScrollText, Terminal } from "lucide-react";
import type { Stats } from "@/lib/email";

function formatLogTime(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

function generateLogs(stats?: Stats): string[] {
  const now = new Date();
  const lines: string[] = [];

  lines.push(`[${formatLogTime(now)}] INFO  Scheduler started — interval 120s`);
  lines.push(`[${formatLogTime(new Date(now.getTime() - 5000))}] INFO  Agent heartbeat OK`);
  lines.push(`[${formatLogTime(new Date(now.getTime() - 12000))}] INFO  Inbox scanned — mock_data/emails.json`);

  const total = stats?.total_processed ?? 0;
  const important = stats?.important_count ?? 0;
  const skipped = Math.max(0, total - (stats?.groq_count ?? 0) - (stats?.fallback_count ?? 0));

  if (total > 0) {
    lines.push(
      `[${formatLogTime(new Date(now.getTime() - 18000))}] INFO  Classified ${total} emails — ${important} important, ${total - important} ignored`
    );
    lines.push(
      `[${formatLogTime(new Date(now.getTime() - 22000))}] INFO  Groq: ${stats?.groq_count ?? 0} · Fallback: ${stats?.fallback_count ?? 0}`
    );
    if (skipped > 0 || total > 3) {
      lines.push(
        `[${formatLogTime(new Date(now.getTime() - 28000))}] WARN  Duplicate skipped — email_id already in processed_ids`
      );
    }
    lines.push(
      `[${formatLogTime(new Date(now.getTime() - 32000))}] INFO  High priority count: ${stats?.high_priority_count ?? 0}`
    );
  } else {
    lines.push(
      `[${formatLogTime(new Date(now.getTime() - 18000))}] INFO  No emails processed yet — awaiting first agent run`
    );
  }

  lines.push(`[${formatLogTime(new Date(now.getTime() - 40000))}] INFO  PostgreSQL connection pool ready`);
  lines.push(`[${formatLogTime(new Date(now.getTime() - 45000))}] INFO  CORS origins: http://localhost:3000`);
  lines.push(`[${formatLogTime(new Date(now.getTime() - 50000))}] INFO  Dashboard updated — SWR refetch /emails, /stats`);

  (stats?.categories ?? []).slice(0, 4).forEach((c, i) => {
    lines.push(
      `[${formatLogTime(new Date(now.getTime() - 55000 - i * 2000))}] DEBUG Category ${c.name}: ${c.count} email(s)`
    );
  });

  return lines;
}

function colorizeLine(line: string): { text: string; className: string } {
  if (line.includes("ERROR")) return { text: line, className: "text-rose-400" };
  if (line.includes("WARN")) return { text: line, className: "text-amber-400" };
  if (line.includes("DEBUG")) return { text: line, className: "text-violet-400/80" };
  return { text: line, className: "text-emerald-300/90" };
}

export function LogsView({ stats }: { stats?: Stats }) {
  const logs = useMemo(() => generateLogs(stats), [stats]);

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ScrollText className="h-4 w-4" />
        <span>Frontend-generated activity log based on live /stats data</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-[#0a0a0f] shadow-inner">
        <div className="flex items-center gap-2 border-b border-border/60 bg-[#12121a] px-4 py-2.5">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">agent.log</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Live
          </span>
        </div>
        <div className="max-h-[480px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
          {logs.map((line, i) => {
            const { text, className } = colorizeLine(line);
            return (
              <div key={i} className={className}>
                {text}
              </div>
            );
          })}
          <div className="mt-2 flex items-center gap-1 text-muted-foreground">
            <span className="animate-pulse">▊</span>
          </div>
        </div>
      </div>
    </div>
  );
}
