import { AlertTriangle, Inbox, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
          <div className="flex gap-4">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-800" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-slate-800" />
              <div className="h-16 w-full animate-pulse rounded-xl bg-slate-800" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function EmptyState({
  title = "Inbox is clear. Waiting for important emails...",
  description = "No important emails right now. New ones appear here automatically as the agent runs.",
  icon = "inbox",
}: {
  title?: string;
  description?: string;
  icon?: "inbox" | "sparkles";
}) {
  const Icon = icon === "sparkles" ? Sparkles : Inbox;

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30 px-6 py-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-slate-800/80">
          <Icon className="h-9 w-9 text-primary/80" />
        </div>
      </div>
      <h3 className="mt-6 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/50 px-4 py-2 text-xs text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
        Agent monitoring · next scan on countdown
      </div>
    </div>
  );
}

export function FilteredEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-14 text-center">
      <Search className="h-8 w-8 text-slate-500" />
      <h3 className="mt-3 text-sm font-medium text-white">No emails match your filters</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-400">
        Try adjusting search terms or clearing priority and category filters.
      </p>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-500/40 bg-rose-500/5 py-14 text-center">
      <AlertTriangle className="h-8 w-8 text-rose-400" />
      <h3 className="mt-3 text-sm font-medium text-white">Can&apos;t reach the agent</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-400">
        The backend is unreachable. Make sure it&apos;s running and NEXT_PUBLIC_BACKEND_URL is
        correct.
      </p>
    </div>
  );
}

export function AgentSuccessBanner({ processed, skipped }: { processed: number; skipped: number }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
      )}
    >
      <Sparkles className="h-4 w-4 shrink-0" />
      <span>
        Agent run complete — <strong>{processed}</strong> processed,{" "}
        <strong>{skipped}</strong> duplicates skipped.
      </span>
    </div>
  );
}
