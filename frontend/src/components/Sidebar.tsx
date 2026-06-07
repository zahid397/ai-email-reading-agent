"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleX,
  Cpu,
  Database,
  Inbox,
  Loader2,
  LayoutDashboard,
  Mail,
  Play,
  ScrollText,
  Settings,
  Wifi,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { addLog } from "@/lib/api";
import { addClientLog } from "@/lib/clientLogs";
import {
  runConnectionTest,
  type ConnectionTestResult,
} from "@/lib/testConnection";

type View =
  | "dashboard" | "important" | "all"
  | "config" | "sources" | "logs" | "settings";

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "important", label: "Important Emails", icon: Inbox },
  { id: "all", label: "All Emails", icon: Mail },
  { id: "config", label: "AI Configuration", icon: Cpu },
  { id: "sources", label: "Sources", icon: Database },
  { id: "logs", label: "Logs", icon: ScrollText },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  view: View;
  onView: (v: View) => void;
  agentRunning: boolean;
  onRunAgent: () => void;
  schedulerSecondsLeft: number;
  schedulerTotalSeconds: number;
}

const STATUS_ICON = {
  ok: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
  fail: <CircleX className="h-3.5 w-3.5 text-red-500" />,
  pending: <Loader2 className="h-3.5 w-3.5 text-orange-400 animate-spin" />,
};

export function Sidebar({
  view,
  onView,
  agentRunning,
  onRunAgent,
  schedulerSecondsLeft,
  schedulerTotalSeconds,
}: SidebarProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(
    null
  );
  const [showTestPanel, setShowTestPanel] = useState(false);

  const mm = String(Math.floor(schedulerSecondsLeft / 60)).padStart(2, "0");
  const ss = String(schedulerSecondsLeft % 60).padStart(2, "0");
  const progress =
    ((schedulerTotalSeconds - schedulerSecondsLeft) / schedulerTotalSeconds) *
    100;

  async function handleTestConnection() {
    setIsTesting(true);
    setShowTestPanel(true);
    addLog("Test connection clicked");

    const pending: ConnectionTestResult = {
      health: "pending",
      stats: "pending",
      emails: "pending",
      allOk: false,
      apiBase: "",
    };
    setTestResult(pending);

    const result = await runConnectionTest();
    setTestResult(result);
    addLog(result.allOk ? "Test connection success" : "Test connection error");
    setIsTesting(false);
  }

  function navigate(to: View) {
    onView(to);
    if (to === "sources") {
      addClientLog("info", "Sources page opened");
    }
    if (to === "settings") {
      addClientLog("info", "Settings page opened");
    }
    if (to === "logs") {
      addClientLog("info", "Logs page opened");
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-white border-r border-gray-200 shrink-0">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              AI Email Agent
            </p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => navigate(id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              view === id
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">
              Agent Status
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500 pulse-dot" />
              Running
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">Polling every 2 minutes</p>
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Next run in</span>
            <span className="font-mono font-semibold">
              {mm}:{ss}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-orange-500 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-3 pb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Quick Actions
        </p>

        <button
          type="button"
          onClick={() => {
            addClientLog("info", "Run Agent Now clicked from sidebar");
            onRunAgent();
          }}
          disabled={agentRunning}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {agentRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {agentRunning ? "Running…" : "Run Agent Now"}
        </button>

        <button
          type="button"
          onClick={() => void handleTestConnection()}
          disabled={isTesting}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          {isTesting ? "Testing…" : "Test Connection"}
        </button>

        {showTestPanel && testResult && (
          <div className="mt-2 mx-1 rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">
                Connection Results
              </span>
              <button
                type="button"
                onClick={() => setShowTestPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-3.5 w-3.5" />
              </button>
            </div>

            {(
              [
                ["Health", testResult.health],
                ["Stats", testResult.stats],
                ["Emails", testResult.emails],
              ] as const
            ).map(([label, val]) => (
              <div
                key={label}
                className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0"
              >
                <span className="text-gray-500">{label}</span>
                <div className="flex items-center gap-1.5">
                  {STATUS_ICON[val]}
                  <span
                    className={cn(
                      "font-medium",
                      val === "ok"
                        ? "text-green-600"
                        : val === "fail"
                          ? "text-red-600"
                          : "text-orange-500"
                    )}
                  >
                    {val === "ok" ? "OK" : val === "fail" ? "Failed" : "…"}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-1.5 mt-1">
              <span className="text-gray-400">API Base: </span>
              <span className="text-gray-600 break-all">
                {testResult.apiBase}
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("logs")}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <ScrollText className="h-4 w-4" />
          View Logs
        </button>
      </div>

      <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
          AD
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            Admin User
          </p>
          <p className="text-xs text-gray-400 truncate">admin@tqtech.ie</p>
        </div>
      </div>
    </aside>
  );
}
