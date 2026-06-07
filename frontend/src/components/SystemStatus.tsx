import { CheckCircle2, CircleX, Shield } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { HealthResponse, StatsResponse } from "@/lib/api";

interface StatusItemProps {
  label: string;
  sub: string;
  ok: boolean | "idle";
}

function StatusItem({ label, sub, ok }: StatusItemProps) {
  return (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      {ok === true ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      ) : ok === false ? (
        <CircleX className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{label}</p>
        <p className="text-xs text-gray-500 truncate">{sub}</p>
      </div>
    </div>
  );
}

interface SystemStatusProps {
  health: HealthResponse | undefined;
  stats: StatsResponse | undefined;
  isError: boolean;
}

export function SystemStatus({ health, stats, isError }: SystemStatusProps) {
  const backendOk = !isError && health?.status === "ok";
  const dbOk = stats !== undefined;
  const groqOk = (stats?.groq_count ?? 0) > 0;
  const fallbackOnly = !groqOk && (stats?.fallback_count ?? 0) > 0;

  const aiLabel = groqOk
    ? "AI Engine Active"
    : fallbackOnly
    ? "AI Engine Active"
    : "AI Engine";
  const aiSub = groqOk
    ? "Groq • Online"
    : fallbackOnly
    ? "Fallback Mode"
    : "Idle";
  const aiOk = groqOk || fallbackOnly ? true : ("idle" as const);

  return (
    <Card>
      <CardHeader>
        <Shield className="h-4 w-4 text-gray-600" />
        <h2 className="text-sm font-semibold text-gray-900">System Status</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-6">
          <StatusItem
            label="Backend Connected"
            sub={backendOk ? "Healthy" : isError ? "Unreachable" : "Checking…"}
            ok={isError ? false : backendOk}
          />
          <StatusItem
            label="Database Connected"
            sub={dbOk ? "Healthy" : isError ? "Unknown" : "Checking…"}
            ok={isError ? false : dbOk}
          />
          <StatusItem
            label={aiLabel}
            sub={aiSub}
            ok={aiOk}
          />
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="relative mt-0.5 shrink-0">
              <span className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 pulse-dot" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Scheduler Active
              </p>
              <p className="text-xs text-gray-500">Polling every 2 min</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
