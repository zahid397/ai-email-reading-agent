"use client";

import { useCallback, useState } from "react";
import { AgentWorkflowModal } from "@/components/agent/AgentWorkflowModal";
import { Header } from "@/components/layout/Header";
import { Sidebar, VIEW_TITLES } from "@/components/layout/Sidebar";
import { AIConfigView } from "@/components/views/AIConfigView";
import { AllEmailsView } from "@/components/views/AllEmailsView";
import { DashboardView } from "@/components/views/DashboardView";
import { ImportantEmailsView } from "@/components/views/ImportantEmailsView";
import { LogsView } from "@/components/views/LogsView";
import { SettingsView } from "@/components/views/SettingsView";
import { SourcesView } from "@/components/views/SourcesView";
import { useAgentData } from "@/hooks/useAgentData";
import { useRunAgent } from "@/hooks/useRunAgent";
import { useScanCountdown } from "@/hooks/useScanCountdown";
import type { View } from "@/lib/config";

export default function DashboardPage() {
  const [view, setView] = useState<View>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [duplicatesPrevented, setDuplicatesPrevented] = useState(0);

  const {
    important,
    all,
    stats,
    importantErr,
    allErr,
    importantLoading,
    allLoading,
    isRefreshing,
    refreshAll,
  } = useAgentData();

  const handleScan = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  const { countdownStr, isScanning, reset: resetCountdown } = useScanCountdown(handleScan);

  const handleAgentComplete = useCallback(async () => {
    await refreshAll();
    resetCountdown();
  }, [refreshAll, resetCountdown]);

  const handleTriggerComplete = useCallback(
    async (skipped: number) => {
      setDuplicatesPrevented((prev) => prev + skipped);
      await handleAgentComplete();
    },
    [handleAgentComplete]
  );

  const {
    triggering,
    workflowOpen,
    currentStep,
    workflowError,
    result,
    runAgent,
    closeWorkflow,
  } = useRunAgent(handleTriggerComplete);

  const { title, subtitle } = VIEW_TITLES[view];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        view={view}
        onViewChange={setView}
        stats={stats}
        countdown={countdownStr}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <Header
          onRefresh={refreshAll}
          onRunAgent={runAgent}
          onMenuOpen={() => setMobileOpen(true)}
          triggering={triggering}
          refreshing={isRefreshing}
          stats={stats}
          important={important}
        />

        <main className="flex-1 px-5 py-6 sm:px-7">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>

          {view === "dashboard" && (
            <DashboardView
              important={important}
              stats={stats}
              loading={importantLoading}
              error={importantErr}
              countdownStr={countdownStr}
              isScanning={isScanning}
              duplicatesPrevented={duplicatesPrevented}
              onForceRun={runAgent}
              triggering={triggering}
            />
          )}

          {view === "important" && (
            <ImportantEmailsView
              emails={important}
              loading={importantLoading}
              error={importantErr}
            />
          )}

          {view === "all" && (
            <AllEmailsView emails={all} loading={allLoading} error={allErr} />
          )}

          {view === "config" && <AIConfigView />}
          {view === "sources" && <SourcesView />}
          {view === "logs" && <LogsView stats={stats} />}
          {view === "settings" && <SettingsView />}
        </main>

        <footer className="border-t border-white/10 px-5 py-3 text-center text-xs text-slate-500">
          © 2026 AI Email Reading Agent · Built for the TQTech technical task.
        </footer>
      </div>

      <AgentWorkflowModal
        open={workflowOpen}
        currentStep={currentStep}
        error={workflowError}
        result={result}
        onClose={closeWorkflow}
      />
    </div>
  );
}
