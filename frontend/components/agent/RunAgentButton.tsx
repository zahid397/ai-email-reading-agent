import { Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function RunAgentButton({
  onClick,
  disabled,
  triggering,
  size = "default",
  className,
}: {
  onClick: () => void;
  disabled?: boolean;
  triggering: boolean;
  size?: "default" | "large";
  className?: string;
}) {
  const isLarge = size === "large";

  return (
    <button
      onClick={onClick}
      disabled={disabled || triggering}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl bg-primary font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60",
        isLarge
          ? "px-6 py-3 text-sm shadow-lg shadow-primary/25"
          : "px-3 py-1.5 text-xs",
        className
      )}
    >
      {triggering ? (
        <>
          <RefreshCw className={cn("animate-spin", isLarge ? "h-4 w-4" : "h-3.5 w-3.5")} />
          Agent Reading Emails...
        </>
      ) : (
        <>
          {isLarge ? <Play className="h-4 w-4" /> : <Play className="h-3.5 w-3.5" />}
          Run Agent
        </>
      )}
    </button>
  );
}

export function RefreshButton({
  onClick,
  refreshing = false,
}: {
  onClick: () => void | Promise<void>;
  refreshing?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={refreshing}
      aria-busy={refreshing}
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
      {refreshing ? "Refreshing…" : "Refresh"}
    </button>
  );
}
