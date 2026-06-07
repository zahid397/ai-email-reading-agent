import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(iso: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function initials(email: string): string {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[.\-_]+/).filter(Boolean);
  if (parts.length >= 2)
    return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-teal-100 text-teal-700",
  "bg-yellow-100 text-yellow-700",
  "bg-indigo-100 text-indigo-700",
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function categoryLabel(raw: string): string {
  return raw
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

const CATEGORY_BADGE: Record<string, string> = {
  PAYMENT_ISSUE: "bg-amber-100 text-amber-700",
  BILLING_ISSUE: "bg-red-100 text-red-700",
  SERVER_DOWN: "bg-rose-100 text-rose-700",
  CLIENT_COMPLAINT: "bg-blue-100 text-blue-700",
  CLIENT_REQUEST: "bg-blue-100 text-blue-700",
  SECURITY: "bg-red-100 text-red-700",
  INTERVIEW: "bg-emerald-100 text-emerald-700",
  SUBSCRIPTION: "bg-teal-100 text-teal-700",
  NEWSLETTER: "bg-yellow-100 text-yellow-700",
  SPAM: "bg-gray-100 text-gray-600",
  OTHER: "bg-gray-100 text-gray-600",
};

export function categoryBadge(raw: string): string {
  return CATEGORY_BADGE[raw] ?? "bg-gray-100 text-gray-600";
}

const PRIORITY_BADGE: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  LOW: "bg-green-100 text-green-700",
};

export function priorityBadge(p: string): string {
  return PRIORITY_BADGE[p] ?? "bg-gray-100 text-gray-600";
}

const PRIORITY_BORDER: Record<string, string> = {
  HIGH: "border-l-red-500",
  MEDIUM: "border-l-orange-500",
  LOW: "border-l-green-500",
};

export function priorityBorder(p: string): string {
  return PRIORITY_BORDER[p] ?? "border-l-gray-300";
}
