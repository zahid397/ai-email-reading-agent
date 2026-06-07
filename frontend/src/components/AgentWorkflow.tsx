"use client";

import { CheckCircle2, Copy, Cpu, Inbox, Loader2, Save } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Inbox, label: "Reading Emails", sub: "Connected to sources" },
  { icon: Copy, label: "Checking Duplicates", sub: "Preventing duplicates" },
  { icon: Cpu, label: "AI Classification", sub: "Rule-based fallback" },
  { icon: Save, label: "Saving Results", sub: "Writing to database" },
];

interface AgentWorkflowProps {
  isRunning: boolean;
  /** 0 = idle, 1–4 = active step (Reading → Saving) */
  workflowStep: number;
}

export function AgentWorkflow({ isRunning, workflowStep }: AgentWorkflowProps) {
  const activeStep =
    workflowStep > 0 ? Math.min(workflowStep, STEPS.length) - 1 : -1;
  const allDone = workflowStep >= STEPS.length;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-gray-900">Agent Workflow</h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-0">
          {STEPS.map((step, idx) => {
            const isActive = isRunning && idx === activeStep && !allDone;
            const isDone = allDone || activeStep > idx;
            const Icon = step.icon;

            return (
              <div key={idx} className="flex items-start flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                      isActive
                        ? "border-orange-500 bg-orange-50 text-orange-600 workflow-pulse"
                        : isDone
                          ? "border-green-500 bg-green-50 text-green-600"
                          : "border-orange-200 bg-orange-50 text-orange-300"
                    )}
                  >
                    {isActive ? (
                      <Loader2 className="h-5 w-5 spin-slow" />
                    ) : isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-2 text-center leading-tight">
                    {step.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 text-center">
                    {step.sub}
                  </p>
                </div>

                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 mt-6 flex-1 max-w-12 transition-colors duration-500",
                      isDone && activeStep >= idx
                        ? "bg-orange-500"
                        : "bg-orange-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
