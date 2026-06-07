"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Flag,
  Loader2,
  Play,
  RefreshCw,
  X,
} from "lucide-react";
import { addClientLog } from "@/lib/clientLogs";
import type { StatsResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  important: "Important Emails",
  all: "All Emails",
  config: "AI Configuration",
  sources: "Sources",
  logs: "System Logs",
  settings: "Settings",
};

interface HeaderProps {
  view: string;
  onRefresh: () => void | Promise<void>;
  onRunAgent: () => void;
  agentRunning: boolean;
  importantCount: number;
  stats: StatsResponse | undefined;
  schedulerSecondsLeft: number;
}

export function Header({
  view,
  onRefresh,
  onRunAgent,
  agentRunning,
  importantCount,
  stats,
  schedulerSecondsLeft,
}: HeaderProps) {
  const [refreshFeedback, setRefreshFeedback] = useState(false);
  const [showBell, setShowBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowBell(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleRefresh() {
    void Promise.resolve(onRefresh()).then(() => {
      setRefreshFeedback(true);
      setTimeout(() => setRefreshFeedback(false), 2_500);
    });
    addClientLog("info", "Refresh clicked from header");
  }

  function handleRunAgent() {
    addClientLog("info", "Run Agent button clicked from header");
    onRunAgent();
  }

  function handleBell() {
    setShowBell((prev) => !prev);
    addClientLog(
      "info",
      `Notification panel ${showBell ? "closed" : "opened"}`
    );
  }

  const highPriorityCount = stats?.high_priority_count ?? 0;
  const hasNotifications = importantCount > 0 || highPriorityCount > 0;
  const bellCount = Math.max(importantCount, highPriorityCount);
  const isGroqActive = (stats?.groq_count ?? 0) > 0;
  const aiModeLabel = isGroqActive ? "Groq" : "Fallback";

  const lastRunLabel = stats?.last_run
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(stats.last_run))
    : "Not yet";

  const mm = String(Math.floor(schedulerSecondsLeft / 60)).padStart(2, "0");
  const ss = String(schedulerSecondsLeft % 60).padStart(2, "0");

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 flex-wrap">
      <h1 className="text-xl font-semibold text-gray-900">
        {VIEW_TITLES[view] ?? "Dashboard"}
      </h1>

      <span
        className={cn(
          "rounded-full border px-3 py-1 text-xs font-semibold",
          isGroqActive
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-yellow-50 border-yellow-200 text-yellow-800"
        )}
      >
        {isGroqActive ? "Groq Active" : "Rule-Based Fallback Mode"}
      </span>

      <span className="text-xs text-gray-500 hidden md:inline">
        Groq: {stats?.groq_count ?? 0} | Fallback:{" "}
        {stats?.fallback_count ?? 0}
      </span>

      <span className="hidden lg:flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
        Scheduler · next run {mm}:{ss}
      </span>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={handleRefresh}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-all",
            refreshFeedback
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          )}
        >
          {refreshFeedback ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {refreshFeedback ? "Refreshed!" : "Refresh"}
        </button>

        <button
          type="button"
          onClick={handleRunAgent}
          disabled={agentRunning}
          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {agentRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {agentRunning ? "Running…" : "Run Agent"}
        </button>

        <div className="relative" ref={bellRef}>
          <button
            type="button"
            onClick={handleBell}
            className={cn(
              "relative h-9 w-9 rounded-full border flex items-center justify-center transition-colors",
              showBell
                ? "border-orange-300 bg-orange-50 text-orange-600"
                : "border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white px-1">
                {bellCount > 99 ? "99+" : bellCount}
              </span>
            )}
          </button>

          {showBell && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                </p>
                <button
                  type="button"
                  onClick={() => setShowBell(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500">
                  {hasNotifications
                    ? "Important emails detected"
                    : "No unread notifications"}
                </p>
              </div>

              <div className="divide-y divide-gray-50">
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Important emails
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-500">
                    {importantCount}
                  </span>
                </div>

                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Flag className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        High priority
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-500">
                    {highPriorityCount}
                  </span>
                </div>

                <div className="px-4 py-3">
                  <p className="text-xs text-gray-400">Last run</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">
                    {lastRunLabel}
                  </p>
                </div>

                <div className="px-4 py-3">
                  <p className="text-xs text-gray-400">Current mode</p>
                  <p className="text-sm text-gray-700 font-medium mt-0.5">
                    {aiModeLabel}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                <p className="text-[11px] text-gray-400 text-center">
                  Total processed: {stats?.total_processed ?? 0} · Runs:{" "}
                  {stats?.total_runs ?? 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
