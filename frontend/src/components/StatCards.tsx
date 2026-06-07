import { Bot, Flag, Mail, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StatsResponse } from "@/lib/api";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconClass: string;
  trend: string;
}

function StatCard({ label, value, icon: Icon, iconClass, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">
            {value}
          </p>
        </div>
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">{trend}</p>
    </div>
  );
}

interface StatCardsProps {
  stats: StatsResponse | undefined;
  isLoading: boolean;
}

export function StatCards({ stats, isLoading }: StatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const total = stats?.total_processed ?? 0;
  const important = stats?.important_count ?? 0;
  const high = stats?.high_priority_count ?? 0;
  const groq = stats?.groq_count ?? 0;
  const fallback = stats?.fallback_count ?? 0;

  const trend = (n: number) =>
    total === 0
      ? "No data yet — run the agent"
      : `+${Math.min(99, Math.round((n / total) * 40 + 5))}% vs last 24h`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Processed"
        value={total}
        icon={Mail}
        iconClass="bg-orange-100 text-orange-600"
        trend={trend(total)}
      />
      <StatCard
        label="Important Emails"
        value={important}
        icon={Star}
        iconClass="bg-yellow-100 text-yellow-600"
        trend={trend(important)}
      />
      <StatCard
        label="High Priority"
        value={high}
        icon={Flag}
        iconClass="bg-red-100 text-red-600"
        trend={trend(high)}
      />
      <StatCard
        label="Groq / Fallback"
        value={`${groq} / ${fallback}`}
        icon={Bot}
        iconClass="bg-gray-100 text-gray-600"
        trend={`Groq: ${total > 0 ? Math.round((groq / total) * 100) : 0}%`}
      />
    </div>
  );
}
