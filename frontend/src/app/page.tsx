"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Settings } from "lucide-react";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCards } from "@/components/StatCards";
import { SystemStatus } from "@/components/SystemStatus";
import { AgentWorkflow } from "@/components/AgentWorkflow";
import { EmailTable } from "@/components/EmailTable";
import { RightPanel } from "@/components/RightPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { SourcesPanel } from "@/components/SourcesPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { DebugFooter } from "@/components/DebugFooter";

import {
  API_BASE,
  endpoint,
  safeFetcher,
  apiPost,
  addLog,
  type HealthResponse,
  type StatsResponse,
  type EmailItem,
  type TriggerResponse,
} from "@/lib/api";
import { addClientLog } from "@/lib/clientLogs";
import { runConnectionTest } from "@/lib/testConnection";

type View =
  | "dashboard"
  | "important"
  | "all"
  | "config"
  | "sources"
  | "logs"
  | "settings";

const DEMO_SCHEDULER_MS = 120_000;
const WORKFLOW_STEP_MS = 700;

function PlaceholderPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
      <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
        <Settings className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-700 capitalize">{label}</p>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">
        AI Configuration is scaffolded for a future iteration.
      </p>
    </div>
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function DashboardPage() {
  const [view, setView] = useState<View>("dashboard");
  const [agentRunning, setAgentRunning] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(0);
  const [schedulerSecondsLeft, setSchedulerSecondsLeft] = useState(
    DEMO_SCHEDULER_MS / 1000
  );
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const agentRunningRef = useRef(false);
  const { mutate } = useSWRConfig();

  const healthKey = endpoint("/health");
  const statsKey = endpoint("/stats");
  const emailsKey = endpoint("/emails");
  const allKey = endpoint("/emails?important_only=false");

  const { data: health, error: healthError } = useSWR<HealthResponse>(
    healthKey,
    safeFetcher,
    { revalidateOnFocus: false }
  );

  const { data: stats, error: statsError } = useSWR<StatsResponse>(
    statsKey,
    safeFetcher,
    { refreshInterval: 30_000 }
  );

  const {
    data: importantEmails,
    error: emailsError,
    isLoading: importantLoading,
  } = useSWR<EmailItem[]>(emailsKey, safeFetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  const { data: allEmails, isLoading: allLoading } = useSWR<EmailItem[]>(
    allKey,
    safeFetcher,
    { refreshInterval: 60_000 }
  );

  useEffect(() => {
    agentRunningRef.current = agentRunning;
  }, [agentRunning]);

  const refreshDashboardData = useCallback(async () => {
    await mutate(statsKey);
    await mutate(emailsKey);
    await mutate(allKey);
    await mutate(healthKey);
  }, [healthKey, statsKey, emailsKey, allKey, mutate]);

  const refreshAll = useCallback(async () => {
    addClientLog("info", "Refresh clicked");
    addLog("Refresh clicked");
    console.log("[dashboard] Refresh — revalidating SWR keys");
    await refreshDashboardData();
  }, [refreshDashboardData]);

  useEffect(() => {
    addClientLog("info", "Dashboard loaded");
    addLog("Dashboard loaded");
    console.log("[dashboard] loaded", {
      apiMode: API_BASE === "" ? "same-origin Next.js API" : "external",
      apiBase: API_BASE || "/api",
    });
  }, []);

  const runAgent = useCallback(
    async (isAuto = false) => {
      if (agentRunningRef.current) return;

      setAgentRunning(true);
      agentRunningRef.current = true;
      setWorkflowStep(0);
      setFeedback(null);
      addClientLog(
        "info",
        isAuto ? "Scheduler auto-run triggered" : "Run Agent clicked"
      );
      addLog(isAuto ? "Scheduler auto-run triggered" : "Run agent clicked");

      setWorkflowStep(1);
      await delay(WORKFLOW_STEP_MS);
      setWorkflowStep(2);
      await delay(WORKFLOW_STEP_MS);
      setWorkflowStep(3);
      await delay(WORKFLOW_STEP_MS);
      setWorkflowStep(4);

      try {
        const result = await apiPost<TriggerResponse>(endpoint("/trigger"));
        console.log("Trigger result", result);

        await mutate(statsKey);
        await mutate(emailsKey);
        await mutate(allKey);
        await mutate(healthKey);

        let msg: string;
        if (result.processed === 0 && result.skipped > 0) {
          msg = `No new emails found. ${result.skipped} skipped by duplicate prevention.`;
        } else {
          msg = `Agent completed: ${result.processed} processed, ${result.skipped} skipped, ${result.failed} failed.`;
        }

        setFeedback({ type: "success", msg });
        addClientLog("success", msg);
        addLog(`Run agent success: ${JSON.stringify(result)}`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Trigger failed";
        setFeedback({ type: "error", msg });
        addClientLog("error", `Run Agent failed: ${msg}`);
        addLog(`Run agent error: ${msg}`);
      } finally {
        await delay(1_000);
        setWorkflowStep(0);
        setAgentRunning(false);
        agentRunningRef.current = false;
        setSchedulerSecondsLeft(DEMO_SCHEDULER_MS / 1000);
        setTimeout(() => setFeedback(null), 5_000);
      }
    },
    [healthKey, statsKey, emailsKey, allKey, mutate]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSchedulerSecondsLeft((prev) => {
        if (prev <= 1) {
          if (!agentRunningRef.current) {
            void runAgent(true);
          }
          return DEMO_SCHEDULER_MS / 1000;
        }
        return prev - 1;
      });
    }, 1_000);

    return () => clearInterval(timer);
  }, [runAgent]);

  const handleResetDemo = useCallback(async () => {
    addClientLog("info", "Reset Demo clicked");
    addLog("Reset Demo clicked");
    try {
      await apiPost(endpoint("/demo/reset"));
      addClientLog("success", "Reset Demo succeeded");
      addLog("Reset Demo success");
      await refreshAll();
      setSchedulerSecondsLeft(DEMO_SCHEDULER_MS / 1000);
    } catch (err) {
      addClientLog("error", `Demo reset failed: ${String(err)}`);
      addLog(`Reset Demo error: ${String(err)}`);
      throw err;
    }
  }, [refreshAll]);

  const handleTestConnection = useCallback(async () => {
    addClientLog("info", "Test connection clicked");
    addLog("Test connection clicked");
    try {
      const result = await runConnectionTest();
      if (result.allOk) {
        addClientLog("success", "Test connection succeeded");
        addLog("Test connection success");
      } else {
        addClientLog("error", "Test connection failed — one or more endpoints unreachable");
        addLog("Test connection error");
      }
      return result;
    } catch (err) {
      addClientLog("error", `Test connection failed: ${String(err)}`);
      addLog(`Test connection error: ${String(err)}`);
      throw err;
    }
  }, []);

  const isDashboardView =
    view === "dashboard" || view === "important" || view === "all";
  const showImportant = view === "dashboard" || view === "important";
  const listEmails = showImportant ? importantEmails : allEmails;
  const listLoading = showImportant ? importantLoading : allLoading;
  const listError = showImportant ? emailsError : undefined;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar
        view={view}
        onView={setView}
        agentRunning={agentRunning}
        onRunAgent={() => void runAgent(false)}
        schedulerSecondsLeft={schedulerSecondsLeft}
        schedulerTotalSeconds={DEMO_SCHEDULER_MS / 1000}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          view={view}
          onRefresh={refreshAll}
          onRunAgent={() => void runAgent(false)}
          agentRunning={agentRunning}
          importantCount={stats?.important_count ?? 0}
          stats={stats}
          schedulerSecondsLeft={schedulerSecondsLeft}
        />

        {feedback && (
          <div
            className={`mx-6 mt-4 rounded-lg px-4 py-3 text-sm font-medium fade-in ${
              feedback.type === "success"
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            {feedback.type === "success" ? "✓ " : "✗ "}
            {feedback.msg}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {view === "logs" && <LogsPanel />}

          {view === "sources" && (
            <SourcesPanel
              stats={stats}
              agentRunning={agentRunning}
              onTestConnection={handleTestConnection}
              onResetDemo={handleResetDemo}
              onRunAgent={() => void runAgent(false)}
            />
          )}

          {view === "settings" && (
            <SettingsPanel
              stats={stats}
              agentRunning={agentRunning}
              schedulerSecondsLeft={schedulerSecondsLeft}
              emailsLoaded={importantEmails?.length ?? 0}
              onResetDemo={handleResetDemo}
              onRunAgent={() => void runAgent(false)}
              onRefresh={refreshAll}
            />
          )}

          {view === "config" && <PlaceholderPanel label={view} />}

          {isDashboardView && (
            <>
              {(view === "dashboard" || view === "important") && (
                <StatCards stats={stats} isLoading={!stats && !statsError} />
              )}

              <div
                className={
                  view === "dashboard"
                    ? "grid grid-cols-1 xl:grid-cols-3 gap-5"
                    : "space-y-5"
                }
              >
                <div
                  className={
                    view === "dashboard"
                      ? "xl:col-span-2 space-y-5"
                      : "space-y-5"
                  }
                >
                  {view === "dashboard" && (
                    <>
                      <SystemStatus
                        health={health}
                        stats={stats}
                        isError={!!healthError}
                      />
                      <AgentWorkflow
                        isRunning={agentRunning}
                        workflowStep={workflowStep}
                      />
                    </>
                  )}

                  <EmailTable
                    emails={listEmails}
                    isLoading={listLoading && !listEmails}
                    isError={!!listError}
                    view={view}
                  />
                </div>

                {view === "dashboard" && (
                  <div className="xl:col-span-1">
                    <RightPanel
                      stats={stats}
                      allEmails={allEmails}
                      isRunning={agentRunning}
                      workflowStep={workflowStep}
                    />
                  </div>
                )}
              </div>

              {view === "dashboard" && (
                <DebugFooter
                  stats={stats}
                  emailsLoaded={importantEmails?.length ?? 0}
                  schedulerSecondsLeft={schedulerSecondsLeft}
                  showReset
                  onResetDemo={() => void handleResetDemo()}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
