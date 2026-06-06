"use client";

import { AlertTriangle, Check, Loader2, X } from "lucide-react";
import { WORKFLOW_STEPS, type TriggerResult } from "@/lib/email";
import { cn } from "@/lib/utils";

export function AgentWorkflowModal({
  open,
  currentStep,
  error,
  result,
  onClose,
}: {
  open: boolean;
  currentStep: number;
  error: string | null;
  result: TriggerResult | null;
  onClose: () => void;
}) {
  if (!open) return null;

  const done = !error && currentStep >= WORKFLOW_STEPS.length - 1 && result !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={done || error ? onClose : undefined}
      />
      <div className="relative w-full max-w-md animate-[fade-in_0.25s_ease-out_both] rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-primary/20">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold">AI Agent Workflow</h2>
            <p className="text-xs text-muted-foreground">Live processing pipeline</p>
          </div>
          {(done || error) && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-2 p-5">
          {WORKFLOW_STEPS.map((step, i) => {
            const isActive = !done && !error && i === currentStep;
            const isComplete = done || i < currentStep;
            const isPending = !done && !error && i > currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300",
                  isActive && "border-primary/40 bg-primary/10 shadow-[0_0_20px_hsl(255_88%_66%_/_0.15)]",
                  isComplete && !isActive && "border-emerald-500/20 bg-emerald-500/5",
                  isPending && "border-border/60 bg-background/40 opacity-50"
                )}
              >
                <span className="text-lg">{step.emoji}</span>
                <span
                  className={cn(
                    "flex-1 text-sm",
                    isActive ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {isActive && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {isComplete && !isActive && (
                  <Check className="h-4 w-4 text-emerald-400" />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mx-5 mb-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Workflow failed</p>
              <p className="mt-0.5 text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
        )}

        {done && result && (
          <div className="mx-5 mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            <p className="font-medium">Scan complete</p>
            <p className="mt-1 text-xs text-emerald-300/80">
              {result.processed} new emails classified · {result.skipped} duplicates prevented ·{" "}
              {result.failed} failed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
