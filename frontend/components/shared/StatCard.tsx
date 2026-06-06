import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tint,
  glow,
}: {
  label: string;
  value?: number | string;
  sublabel?: string;
  icon: LucideIcon;
  tint: string;
  glow?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:scale-[1.02]",
        glow ?? "border-border bg-card/40"
      )}
    >
      <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/5 blur-xl" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg border border-white/5", tint)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-white">{value ?? "—"}</p>
      {sublabel && (
        <p className="mt-1 text-[11px] text-slate-500">{sublabel}</p>
      )}
    </div>
  );
}
