"use client";

import { Bell, Play, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  view: string;
  onRefresh: () => void;
  onRunAgent: () => void;
  agentRunning: boolean;
  importantCount: number;
}

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  important: "Important Emails",
  all: "All Emails",
  config: "AI Configuration",
  sources: "Sources",
  logs: "Logs",
  settings: "Settings",
};

export function Header({
  view,
  onRefresh,
  onRunAgent,
  agentRunning,
  importantCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
      <h1 className="text-xl font-semibold text-gray-900">
        {VIEW_TITLES[view] ?? "Dashboard"}
      </h1>

      <span className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
        Agent Running • polling every 2 min
      </span>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="secondary" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>

        <Button variant="primary" loading={agentRunning} onClick={onRunAgent}>
          {!agentRunning && <Play className="h-4 w-4" />}
          {agentRunning ? "Running…" : "Run Agent"}
        </Button>

        <div className="relative ml-1">
          <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          {importantCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white px-1">
              {importantCount}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
