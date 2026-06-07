import { RENDER_BACKEND_URL, type StatsResponse, type TriggerResponse } from "@/lib/api";

export async function fetchBackendStats(): Promise<StatsResponse | null> {
  if (!RENDER_BACKEND_URL) return null;
  try {
    const res = await fetch(`${RENDER_BACKEND_URL}/stats`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as StatsResponse;
  } catch {
    return null;
  }
}

/** Use live backend only when Groq is active; otherwise mock demo engine. */
export function isLiveGroqBackend(stats: StatsResponse | null): boolean {
  return stats !== null && (stats.groq_count ?? 0) > 0;
}

export async function fetchBackendTrigger(): Promise<TriggerResponse | null> {
  if (!RENDER_BACKEND_URL) return null;
  try {
    const res = await fetch(`${RENDER_BACKEND_URL}/trigger`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as TriggerResponse;
  } catch {
    return null;
  }
}
