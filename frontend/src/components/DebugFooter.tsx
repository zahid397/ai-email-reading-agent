import { API_BASE } from "@/lib/api";
import { MOCK_INBOX_SIZE } from "@/lib/mockEngine";
import type { StatsResponse } from "@/lib/api";

interface DebugFooterProps {
  stats: StatsResponse | undefined;
  emailsLoaded: number;
  schedulerSecondsLeft?: number;
  showReset?: boolean;
  onResetDemo?: () => void;
}

export function DebugFooter({
  stats,
  emailsLoaded,
  schedulerSecondsLeft,
  showReset = false,
  onResetDemo,
}: DebugFooterProps) {
  const isMockMode =
    (stats?.groq_count ?? 0) === 0 && (stats?.fallback_count ?? 0) > 0;
  const dataMode = isMockMode ? "mock" : "render";

  const lastRunLabel = stats?.last_run
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(stats.last_run))
    : "—";

  const schedulerLabel =
    schedulerSecondsLeft !== undefined
      ? `${String(Math.floor(schedulerSecondsLeft / 60)).padStart(2, "0")}:${String(schedulerSecondsLeft % 60).padStart(2, "0")}`
      : null;

  return (
    <div className="border-t border-gray-200 pt-4 pb-2 space-y-2">
      {showReset && onResetDemo && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>© 2026 TQTech Ltd.</span>
          <button
            type="button"
            onClick={onResetDemo}
            className="text-xs underline hover:text-orange-600 transition-colors"
          >
            Reset demo state
          </button>
        </div>
      )}
      <div className="text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
        <span>
          API mode:{" "}
          {API_BASE === "" ? "same-origin Next.js API" : "External"}
        </span>
        <span>|</span>
        <span>Data mode: {dataMode}</span>
        <span>|</span>
        <span>API base: {API_BASE || "/api"}</span>
        <span>|</span>
        <span>Emails loaded: {emailsLoaded}</span>
        <span>|</span>
        <span>
          Total processed: {stats?.total_processed ?? 0}/{MOCK_INBOX_SIZE}
        </span>
        <span>|</span>
        <span>Last run: {lastRunLabel}</span>
        <span>|</span>
        <span>Background scheduler: polling every 2 min</span>
        {schedulerLabel && (
          <>
            <span>|</span>
            <span>Next scheduler run: {schedulerLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}
