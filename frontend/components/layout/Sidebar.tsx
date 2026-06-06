"use client";

import {
  Bot,
  Database,
  Inbox,
  LayoutDashboard,
  Mails,
  ScrollText,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import type { View } from "@/lib/config";
import { POLL_SECONDS } from "@/lib/config";
import type { Stats } from "@/lib/email";
import { cn } from "@/lib/utils";

const NAV: { id: View; label: string; icon: typeof Inbox }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "important", label: "Important Emails", icon: Inbox },
  { id: "all", label: "All Emails", icon: Mails },
  { id: "config", label: "AI Configuration", icon: Sparkles },
  { id: "sources", label: "Sources", icon: Database },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  view,
  onViewChange,
  stats,
  countdown,
  mobileOpen,
  onMobileClose,
}: {
  view: View;
  onViewChange: (v: View) => void;
  stats?: Stats;
  countdown: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">AI Email Agent</p>
            <span className="text-[10px] text-muted-foreground">v1.0.0</span>
          </div>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="mt-7 flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              onViewChange(id);
              onMobileClose?.();
            }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              view === id
                ? "bg-primary/15 font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-border bg-background/40 p-3.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Agent Status</span>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Running
          </span>
        </div>
        <svg viewBox="0 0 200 36" className="mt-2 h-9 w-full" preserveAspectRatio="none">
          <polyline
            className="heartbeat-line"
            points="0,18 30,18 40,6 52,30 64,18 90,18 100,10 112,26 124,18 200,18"
            fill="none"
            stroke="hsl(152 70% 50%)"
            strokeWidth="2"
          />
        </svg>
        <div className="mt-2 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Next check in</span>
            <span className="font-mono font-medium text-foreground">{countdown}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Poll interval</span>
            <span className="font-medium text-foreground">{POLL_SECONDS / 60} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total processed</span>
            <span className="font-medium text-foreground">{stats?.total_processed ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2.5 rounded-xl px-2 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/30 text-xs font-semibold text-primary-foreground">
          Z
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium leading-tight">Zahid Hasan</p>
          <span className="text-[10px] text-muted-foreground">Admin</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          "flex w-64 shrink-0 flex-col border-r border-border bg-card/40 px-3 py-5",
          "fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:flex"
        )}
      >
        {content}
      </aside>
    </>
  );
}

export const VIEW_TITLES: Record<View, { title: string; subtitle: string }> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "AI monitors your inbox and surfaces only the emails that need you.",
  },
  important: {
    title: "Important Emails",
    subtitle: "Emails flagged as important by the AI classifier — filter and search below.",
  },
  all: {
    title: "All Emails",
    subtitle: "Every processed email in the system, including non-important ones.",
  },
  config: {
    title: "AI Configuration",
    subtitle: "Hybrid AI pipeline settings and classifier output schema.",
  },
  sources: {
    title: "Sources",
    subtitle: "Connected inbox data sources feeding the agent.",
  },
  logs: {
    title: "Logs",
    subtitle: "Agent activity log — scheduler, scans, and duplicate prevention.",
  },
  settings: {
    title: "Settings",
    subtitle: "Project configuration and environment health.",
  },
};
