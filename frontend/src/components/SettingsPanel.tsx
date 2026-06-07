"use client";

import { useState } from "react";
import {
  Bot,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Server,
  Settings2,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import type { StatsResponse } from "@/lib/api";
import { addClientLog } from "@/lib/clientLogs";
import { DebugFooter } from "@/components/DebugFooter";

interface SettingsPanelProps {
  stats: StatsResponse | undefined;
  agentRunning: boolean;
  schedulerSecondsLeft: number;
  emailsLoaded: number;
  onResetDemo: () => Promise<void>;
  onRunAgent: () => void;
  onRefresh: () => Promise<void>;
}

export function SettingsPanel({
  stats,
  agentRunning,
  schedulerSecondsLeft,
  emailsLoaded,
  onResetDemo,
  onRunAgent,
  onRefresh,
}: SettingsPanelProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isGroqActive = (stats?.groq_count ?? 0) > 0;
  const mm = String(Math.floor(schedulerSecondsLeft / 60)).padStart(2, "0");
  const ss = String(schedulerSecondsLeft % 60).padStart(2, "0");

  async function handleReset() {
    setIsResetting(true);
    addClientLog("info", "Reset Demo clicked from Settings page");
    try {
      await onResetDemo();
      setNotice("Mock demo reset successfully.");
      addClientLog("success", "Settings: demo reset succeeded");
    } catch (err) {
      setNotice(`Reset failed: ${String(err)}`);
      addClientLog("error", `Settings: demo reset failed — ${String(err)}`);
    } finally {
      setIsResetting(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    addClientLog("info", "Settings: refresh dashboard clicked");
    await onRefresh();
    setNotice("Dashboard refreshed.");
    setIsRefreshing(false);
  }

  function handleRunAgent() {
    addClientLog("info", "Run Agent clicked from Settings page");
    onRunAgent();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-orange-500" />
          Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          API configuration, demo controls, and scheduler status.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
          {notice}
        </div>
      )}

      {/* A. API Mode */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Server className="h-4 w-4 text-gray-500" />
          API Mode
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <dt className="text-xs text-gray-500">Current mode</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              {API_BASE === ""
                ? "Same-origin Next.js API fallback mode"
                : "External backend mode"}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <dt className="text-xs text-gray-500">API base</dt>
            <dd className="font-medium text-gray-900 mt-0.5 font-mono text-xs">
              {API_BASE || "/api"}
            </dd>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3 md:col-span-2">
            <dt className="text-xs text-gray-500">Render backend</dt>
            <dd className="font-medium text-gray-900 mt-0.5">
              Configured in server environment (RENDER_BACKEND_URL)
            </dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
          The live Vercel demo uses Next.js API routes with Render backend
          fallback. If Render fails or returns empty data, the mock engine
          provides safe demo data without real credentials.
        </p>
      </section>

      {/* B. Demo Controls */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Demo Controls
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleReset()}
            disabled={isResetting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
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
            onClick={handleRunAgent}
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
          <button
            type="button"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Dashboard
          </button>
        </div>
      </section>

      {/* C. AI Engine */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="h-4 w-4 text-orange-500" />
          AI Engine
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              isGroqActive
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-yellow-50 border-yellow-200 text-yellow-800"
            }`}
          >
            {isGroqActive ? "Groq Active" : "Rule-Based Fallback Mode"}
          </span>
          <span className="text-sm text-gray-600">
            Groq: {stats?.groq_count ?? 0} | Fallback:{" "}
            {stats?.fallback_count ?? 0}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Groq is only shown active when the backend returns groq_count &gt; 0.
        </p>
      </section>

      {/* D. Scheduler */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          Scheduler
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3">
            <p className="text-xs text-green-700 font-medium">Status</p>
            <p className="font-semibold text-green-800">Active</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500">Interval</p>
            <p className="font-semibold text-gray-900">Polling every 2 minutes</p>
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3">
            <p className="text-xs text-orange-700 font-medium">Next run</p>
            <p className="font-mono font-semibold text-orange-800">
              {mm}:{ss}
            </p>
          </div>
        </div>
      </section>

      {/* E. Limitations */}
      <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-3">
        <h3 className="text-sm font-semibold text-red-600">Limitations</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          The live Vercel demo may use fallback/mock mode for stability when the
          Render free-tier backend is sleeping or unavailable. No real Gmail or
          Outlook credentials are required for review.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          The full FastAPI backend, APScheduler (2-minute polling), duplicate
          prevention, Groq + rule-based classifier, and Docker Compose setup are
          included in this repository and run locally with{" "}
          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
            docker compose up --build
          </code>
          .
        </p>
      </section>

      <DebugFooter
        stats={stats}
        emailsLoaded={emailsLoaded}
        schedulerSecondsLeft={schedulerSecondsLeft}
      />
    </div>
  );
}
