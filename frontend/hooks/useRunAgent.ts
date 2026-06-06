"use client";

import { useCallback, useRef, useState } from "react";
import { BACKEND_URL } from "@/lib/config";
import { WORKFLOW_STEPS, type TriggerResult } from "@/lib/email";

const STEP_DELAY_MS = 750;

export function useRunAgent(onComplete: (skipped: number) => Promise<void>) {
  const [triggering, setTriggering] = useState(false);
  const [workflowOpen, setWorkflowOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [result, setResult] = useState<TriggerResult | null>(null);
  const abortRef = useRef(false);

  const runAgent = useCallback(async () => {
    abortRef.current = false;
    setTriggering(true);
    setWorkflowOpen(true);
    setWorkflowError(null);
    setResult(null);
    setCurrentStep(0);

    try {
      for (let i = 0; i < WORKFLOW_STEPS.length - 1; i++) {
        setCurrentStep(i);
        await new Promise((r) => setTimeout(r, STEP_DELAY_MS));
        if (abortRef.current) return;
      }

      setCurrentStep(WORKFLOW_STEPS.length - 2);

      const res = await fetch(`${BACKEND_URL}/trigger`, { method: "POST" });
      if (!res.ok) {
        throw new Error(`Trigger failed (${res.status})`);
      }

      const data = (await res.json()) as TriggerResult;
      setResult(data);

      setCurrentStep(WORKFLOW_STEPS.length - 1);
      await onComplete(data.skipped);

      await new Promise((r) => setTimeout(r, 900));
      if (!abortRef.current) setWorkflowOpen(false);
    } catch (err) {
      setWorkflowError(err instanceof Error ? err.message : "Agent run failed");
    } finally {
      setTriggering(false);
    }
  }, [onComplete]);

  const closeWorkflow = useCallback(() => {
    abortRef.current = true;
    setWorkflowOpen(false);
    setTriggering(false);
  }, []);

  return {
    triggering,
    workflowOpen,
    currentStep,
    workflowError,
    result,
    runAgent,
    closeWorkflow,
  };
}
