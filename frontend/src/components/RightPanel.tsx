import {
  CheckCircle2,
  Clock,
  Database,
  Loader2,
  Mail,
  Cpu,
  Save,
  Copy,
  Inbox,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import type { EmailItem, StatsResponse } from "@/lib/api";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  stats: StatsResponse | undefined;
  allEmails: EmailItem[] | undefined;
  isRunning: boolean;
  workflowStep: number;
}

const PIPELINE_STEPS = [
  { icon: Inbox, label: "Reading Emails",      sub: "Connected to sources" },
  { icon: Copy,  label: "Checking Duplicates", sub: "No duplicates found" },
  { icon: Cpu,   label: "AI Classification",   sub: "Analyzing with Groq" },
  { icon: Save,  label: "Saving Results",      sub: "Writing to database" },
];

export function RightPanel({
  stats,
  allEmails,
  isRunning,
  workflowStep,
}: RightPanelProps) {
  const latestEmail = allEmails?.[0];
  const recent = allEmails?.slice(0, 6) ?? [];
  const hasData = recent.length > 0;

  return (
    <div className="space-y-4">
      {/* AI Classification Pipeline */}
      <Card>
        <CardHeader>
          <Cpu className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-900">
            AI Classification Pipeline
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PIPELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = isRunning && idx === workflowStep;
              const isDone = isRunning
                ? idx < workflowStep
                : hasData;

              return (
                <div key={idx} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all",
                      isCurrent
                        ? "bg-orange-100 text-orange-600"
                        : isDone
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {isCurrent ? (
                      <Loader2 className="h-4 w-4 spin-slow" />
                    ) : isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">
                      {step.label}
                    </p>
                    <p className="text-[11px] text-gray-400">{step.sub}</p>
                  </div>
                  {latestEmail && (
                    <span className="text-[11px] text-gray-400 whitespace-nowrap">
                      {timeAgo(latestEmail.created_at)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Recent Activity
          </h2>
          <button className="text-xs text-gray-400 hover:text-gray-600">
            View all
          </button>
        </CardHeader>
        <CardContent>
          {!hasData ? (
            <p className="text-xs text-gray-400 text-center py-4">
              No activity yet
            </p>
          ) : (
            <ul className="space-y-3">
              {[
                `Processed ${stats?.total_processed ?? 0} emails`,
                `AI classified ${stats?.important_count ?? 0} as important`,
                `Saved results to database`,
                `Scheduler triggered`,
                `Connected to mock data`,
                `Agent run completed`,
              ]
                .slice(0, 6)
                .map((msg, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 font-medium">{msg}</p>
                      <p className="text-[11px] text-gray-400">
                        {latestEmail ? timeAgo(latestEmail.created_at) : "—"}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Source Status */}
      <Card>
        <CardHeader className="justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Source Status
          </h2>
          <button className="text-xs text-gray-400 hover:text-gray-600">
            Manage
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { icon: Mail, label: "Gmail (IMAP)", connected: false },
              { icon: Mail, label: "Outlook (IMAP)", connected: false },
              { icon: Database, label: "Mock Data", connected: true },
            ].map(({ icon: Icon, label, connected }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{label}</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    connected
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {connected ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Active
                    </>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduler Timeline */}
      <Card>
        <CardHeader className="justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Scheduler Timeline
          </h2>
          <button className="text-xs text-gray-400 hover:text-gray-600">
            View all
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { msg: "Agent run started",       time: latestEmail?.created_at },
              { msg: "Reading emails…",          time: latestEmail?.created_at },
              { msg: "Processing in progress",   time: latestEmail?.created_at },
              { msg: "Next run scheduled",       time: undefined },
            ].map(({ msg, time }, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700">{msg}</p>
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap">
                  {time ? timeAgo(time) : "pending"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
