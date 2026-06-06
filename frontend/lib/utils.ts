import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Reusable fetcher for SWR. Throws on non-2xx so SWR surfaces the error. */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}) for ${url}`);
  }
  return res.json() as Promise<T>;
}

/** Format an ISO date string into a compact, readable label. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/** Human "time ago" label (e.g. "2m ago", "1h ago", "3d ago"). */
export function timeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

/** Two-letter initials from an email address or display name. */
export function initials(value: string): string {
  const local = value.split("@")[0] ?? value;
  const parts = local.split(/[.\-_\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

/** Deterministic avatar background class from a string seed. */
export function avatarColor(seed: string): string {
  const palette = [
    "bg-rose-500/20 text-rose-300",
    "bg-amber-500/20 text-amber-300",
    "bg-emerald-500/20 text-emerald-300",
    "bg-sky-500/20 text-sky-300",
    "bg-violet-500/20 text-violet-300",
    "bg-fuchsia-500/20 text-fuchsia-300",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}
