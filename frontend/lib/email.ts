export interface Email {
  email_id: string;
  sender: string;
  subject: string;
  body: string;
  date: string;
  important: boolean;
  priority: string;
  category: string;
  reason: string;
  classifier_source: string;
  created_at: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface Stats {
  total_processed: number;
  important_count: number;
  fallback_count: number;
  groq_count: number;
  high_priority_count: number;
  categories: CategoryCount[];
}

export interface TriggerResult {
  processed: number;
  skipped: number;
  failed: number;
}

export const WORKFLOW_STEPS = [
  { id: 1, emoji: "📬", label: "Scanning Inbox" },
  { id: 2, emoji: "🤖", label: "Calling Groq AI" },
  { id: 3, emoji: "🔒", label: "Checking Duplicates" },
  { id: 4, emoji: "📊", label: "Updating Dashboard" },
] as const;

/** Per-priority visual config (dot, left border, badge text/bg). */
export const PRIORITY = {
  HIGH: {
    dot: "bg-rose-500",
    border: "border-l-rose-500",
    badge: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  },
  MEDIUM: {
    dot: "bg-amber-500",
    border: "border-l-amber-500",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  LOW: {
    dot: "bg-slate-400",
    border: "border-l-slate-500",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  },
} as const;

export function priorityStyle(priority: string) {
  return PRIORITY[priority as keyof typeof PRIORITY] ?? {
    dot: "bg-zinc-500",
    border: "border-l-zinc-500",
    badge: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  };
}

/** Stable hex color per category (used by donut + legend). */
export const CATEGORY_HEX: Record<string, string> = {
  PAYMENT_ISSUE: "#a78bfa",
  BILLING_ISSUE: "#f472b6",
  SERVER_DOWN: "#fb923c",
  CLIENT_COMPLAINT: "#38bdf8",
  SECURITY: "#f87171",
  INTERVIEW: "#34d399",
  SUBSCRIPTION: "#2dd4bf",
  NEWSLETTER: "#fbbf24",
  SPAM: "#94a3b8",
  OTHER: "#64748b",
};

export function categoryHex(name: string): string {
  return CATEGORY_HEX[name] ?? "#64748b";
}

/** Human-readable category label, e.g. PAYMENT_ISSUE -> "Payment Issue". */
export function categoryLabel(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** Tailwind classes for a colored category badge (tinted bg + matching text). */
const CATEGORY_BADGE: Record<string, string> = {
  PAYMENT_ISSUE: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  BILLING_ISSUE: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  SERVER_DOWN: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  CLIENT_COMPLAINT: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  SECURITY: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  INTERVIEW: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  SUBSCRIPTION: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  NEWSLETTER: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  SPAM: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  OTHER: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export function categoryBadge(name: string): string {
  return CATEGORY_BADGE[name] ?? CATEGORY_BADGE.OTHER;
}
