"use client";

import { useState } from "react";
import {
  CheckCircle2,
  CircleX,
  Database,
  Loader2,
  Mail,
  Play,
  RefreshCw,
  RotateCcw,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_INBOX_SIZE } from "@/lib/mockEngine";
import type { StatsResponse } from "@/lib/api";
import {
  runConnectionTest,
  type ConnectionTestResult,
} from "@/lib/testConnection";
import { addClientLog } from "@/lib/clientLogs";

const SOURCE_CARDS = [
  {
    id: "gmail",
    name: "Gmail / IMAP",
    icon: Mail,
    status: "Demo Ready / Mock Mode",
    description: "Connect Gmail or IMAP inbox in production.",
    badge: "Future Integration",
    badgeClass: "bg-gray-100 text-gray-600",
    connected: false,
  },
  {
    id: "outlook",
    name: "Outlook / IMAP",
    icon: Mail,
    status: "Demo Ready / Mock Mode",
    description: "Outlook/IMAP source support planned.",
    badge: "Future Integration",
    badgeClass: "bg-gray-100 text-gray-600",
    connected: false,
  },
  {
    id: "mock",
    name: "Mock Dataset",
    icon: Database,
    status: "Active",
    description:
      "Local mock inbox used for safe testing without real credentials.",
    badge: "Connected",
    badgeClass: "bg-green-100 text-green-700",
    connected: true,
  },
] as const;

interface SourcesPanelProps {
  stats: StatsResponse | undefined;
  agentRunning: boolean;
  onTestConnection: () => Promise<ConnectionTestResult>;
  onResetDemo: () => Promise<void>;
  onRunAgent: () => void;
}

export function SourcesPanel({
  stats,
  agentRunning,
  onTestConnection,
  onResetDemo,
  onRunAgent,
}: SourcesPanelProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(
    null
  );
  const [actionMsg, setActionMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleTestConnection() {
    setIsTesting(true);
    setActionMsg(null);
    try {
      const result = await onTestConnection();
      setTestResult(result);
      setActionMsg({
        type: result.allOk ? "success" : "error",
        text: result.allOk
          ? "Connection test passed — all endpoints responding."
          : "Connection test failed — check one or more endpoints.",
      });
    } finally {
      setIsTesting(false);
    }
  }

  async function handleResetDemo() {
    setIsResetting(true);
    setActionMsg(null);
    addClientLog("info", "Reset Demo clicked from Sources page");
    try {
      await onResetDemo();
      setActionMsg({
        type: "success",
        text: "Mock demo reset — inbox re-seeded with 4 processed emails.",
      });
      addClientLog("success", "Reset Demo succeeded from Sources page");
    } catch (err) {
      const msg = String(err);
      setActionMsg({ type: "error", text: `Reset failed: ${msg}` });
      addClientLog("error", `Reset Demo failed: ${msg}`);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Email Sources</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure where the agent reads incoming mail. The live demo uses the
          mock dataset only.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SOURCE_CARDS.map((source) => {
          const Icon = source.icon;
          return (
            <div
              key={source.id}
              className={cn(
                "bg-white border rounded-xl p-5 shadow-sm",
                source.connected
                  ? "border-orange-200 ring-1 ring-orange-100"
                  : "border-gray-100"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full",
                    source.badgeClass
                  )}
                >
                  {source.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">
                {source.name}
              </h3>
              <p className="text-xs text-green-600 font-medium mt-1">
                Status: {source.status}
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {source.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Active Source Details — Mock Dataset
        </h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { label: "Source type", value: "Mock JSON / CSV style dataset" },
            { label: "Total mock inbox", value: `${MOCK_INBOX_SIZE} emails` },
            {
              label: "Processed emails",
              value: String(stats?.total_processed ?? 0),
            },
            {
              label: "Important detected",
              value: String(stats?.important_count ?? 0),
            },
            { label: "Duplicate prevention", value: "Active" },
            { label: "Scheduler", value: "Polling every 2 min" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-gray-50 px-4 py-3">
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="font-semibold text-gray-900 mt-0.5">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleTestConnection()}
          disabled={isTesting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wifi className="h-4 w-4" />
          )}
          Test Connection
        </button>
        <button
          type="button"
          onClick={() => void handleResetDemo()}
          disabled={isResetting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isResetting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Reset Mock Demo
        </button>
        <button
          type="button"
          onClick={() => {
            addClientLog("info", "Run Agent clicked from Sources page");
            onRunAgent();
          }}
          disabled={agentRunning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {agentRunning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run Agent
        </button>
      </div>

      {testResult && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-700 mb-3">
            Connection Test Results
          </p>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {(
              [
                ["Health", testResult.health],
                ["Stats", testResult.stats],
                ["Emails", testResult.emails],
              ] as const
            ).map(([label, val]) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              >
                {val === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <CircleX className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    val === "ok" ? "text-green-700" : "text-red-700"
                  )}
                >
                  {label}: {val === "ok" ? "OK" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {actionMsg && (
        <div
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-medium border",
            actionMsg.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          {actionMsg.type === "success" ? "✓ " : "✗ "}
          {actionMsg.text}
        </div>
      )}
    </div>
  );
}
