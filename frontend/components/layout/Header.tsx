"use client";

import { Menu } from "lucide-react";
import { RefreshButton, RunAgentButton } from "@/components/agent/RunAgentButton";
import { NotificationBell } from "@/components/layout/NotificationBell";
import type { Email, Stats } from "@/lib/email";

export function Header({
  onRefresh,
  onRunAgent,
  onMenuOpen,
  triggering,
  refreshing,
  stats,
  important,
}: {
  onRefresh: () => void | Promise<void>;
  onRunAgent: () => void;
  onMenuOpen: () => void;
  triggering: boolean;
  refreshing?: boolean;
  stats?: Stats;
  important?: Email[];
}) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/70 px-5 py-3 backdrop-blur">
      <button
        onClick={onMenuOpen}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
        Agent Running
        <span className="hidden text-emerald-400/60 sm:inline">· polling every 2 min</span>
      </span>

      <div className="ml-auto flex items-center gap-2">
        <RefreshButton onClick={onRefresh} refreshing={refreshing} />
        <RunAgentButton onClick={onRunAgent} triggering={triggering} />
        <NotificationBell
          important={important}
          count={stats?.important_count ?? important?.length ?? 0}
        />
      </div>
    </header>
  );
}
