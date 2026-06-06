import { Brain, Copy, Mail, ShieldCheck } from "lucide-react";
import { StatCard } from "@/components/shared/StatCard";
import type { Stats } from "@/lib/email";

export function DashboardStatCards({
  stats,
  duplicatesPrevented,
}: {
  stats?: Stats;
  duplicatesPrevented: number;
}) {
  const groqActive = (stats?.groq_count ?? 0) > 0;

  return (
    <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Total Emails Scanned"
        value={stats?.total_processed}
        icon={Mail}
        tint="text-sky-300 bg-sky-500/15"
        glow="border-white/10 bg-slate-900/60 shadow-[0_0_30px_rgba(56,189,248,0.06)]"
      />
      <StatCard
        label="Important Found"
        value={stats?.important_count}
        icon={ShieldCheck}
        tint="text-emerald-300 bg-emerald-500/15"
        glow="border-white/10 bg-slate-900/60 shadow-[0_0_30px_rgba(52,211,153,0.08)]"
      />
      <StatCard
        label="Duplicates Prevented"
        value={duplicatesPrevented}
        sublabel="DB processed_ids guard"
        icon={Copy}
        tint="text-amber-300 bg-amber-500/15"
        glow="border-white/10 bg-slate-900/60 shadow-[0_0_30px_rgba(251,191,36,0.08)]"
      />
      <StatCard
        label="AI Engine"
        value="Groq / Llama3"
        sublabel={
          groqActive
            ? `${stats?.groq_count} via Groq · ${stats?.fallback_count} fallback`
            : "Fallback mode (no API key)"
        }
        icon={Brain}
        tint="text-violet-300 bg-violet-500/15"
        glow="border-white/10 bg-slate-900/60 shadow-[0_0_30px_rgba(167,139,250,0.08)]"
      />
    </section>
  );
}
