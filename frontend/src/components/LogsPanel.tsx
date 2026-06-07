"use client";

import { useEffect, useState } from "react";
import { Trash2, RefreshCw, Terminal } from "lucide-react";
import {
  getClientLogs,
  clearClientLogs,
  addClientLog,
  type ClientLog,
  type LogLevel,
} from "@/lib/clientLogs";

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  success: "bg-green-50 text-green-700 border-green-200",
  error: "bg-red-50 text-red-700 border-red-200",
  warn: "bg-amber-50 text-amber-700 border-amber-200",
};

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function LogsPanel() {
  const [logs, setLogs] = useState<ClientLog[]>([]);
  const [filter, setFilter] = useState<LogLevel | "all">("all");

  function refresh() {
    setLogs(getClientLogs());
  }

  function handleClear() {
    clearClientLogs();
    setLogs([]);
    addClientLog("info", "Logs cleared by user");
    refresh();
  }

  useEffect(() => {
    addClientLog("info", "Logs page opened");
    refresh();
    const t = setInterval(refresh, 3_000);
    return () => clearInterval(t);
  }, []);

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-orange-500" />
          <h2 className="text-base font-semibold text-gray-900">System Logs</h2>
          <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-medium">
            {filtered.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["all", "info", "success", "warn", "error"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              refresh();
              addClientLog("info", "Logs refreshed manually");
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Logs
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Logs
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-50 max-h-[calc(100vh-280px)] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <Terminal className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              No logs yet. Run an action to generate logs.
            </p>
            <p className="text-xs text-gray-400 mt-2 max-w-sm">
              Try Run Agent, Test Connection, Reset Demo, or open Sources /
              Settings to populate this panel.
            </p>
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs text-gray-400 font-mono shrink-0 mt-0.5 w-36">
                {formatTime(log.time)}
              </span>
              <span
                className={`shrink-0 inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${LEVEL_STYLES[log.level]}`}
              >
                {log.level}
              </span>
              <p className="text-sm text-gray-700 flex-1 leading-relaxed break-words">
                {log.message}
              </p>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
          <span>
            Showing {filtered.length} of {logs.length} entries
          </span>
          <span>Stored in localStorage · auto-refreshes every 3s</span>
        </div>
      )}
    </div>
  );
}
