"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { BACKEND_URL, POLL_MS } from "@/lib/config";
import type { Email, Stats } from "@/lib/email";
import { fetcher } from "@/lib/utils";

export function useAgentData() {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    data: important,
    error: importantErr,
    isLoading: importantLoading,
    mutate: mutateImportant,
  } = useSWR<Email[]>(`${BACKEND_URL}/emails`, fetcher, {
    refreshInterval: POLL_MS,
    revalidateOnFocus: false,
  });

  const {
    data: all,
    error: allErr,
    isLoading: allLoading,
    mutate: mutateAll,
  } = useSWR<Email[]>(`${BACKEND_URL}/emails?important_only=false`, fetcher, {
    refreshInterval: POLL_MS,
    revalidateOnFocus: false,
  });

  const {
    data: stats,
    error: statsErr,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<Stats>(`${BACKEND_URL}/stats`, fetcher, {
    refreshInterval: POLL_MS,
    revalidateOnFocus: false,
  });

  const refreshAll = useCallback(async () => {
    setIsManualRefreshing(true);
    try {
      await Promise.all([
        mutateImportant(undefined, { revalidate: true }),
        mutateAll(undefined, { revalidate: true }),
        mutateStats(undefined, { revalidate: true }),
      ]);
    } finally {
      setIsManualRefreshing(false);
    }
  }, [mutateImportant, mutateAll, mutateStats]);

  return {
    important,
    all,
    stats,
    importantErr,
    allErr,
    statsErr,
    importantLoading,
    allLoading,
    statsLoading,
    isRefreshing: isManualRefreshing,
    refreshAll,
    mutateImportant,
    mutateAll,
    mutateStats,
  };
}
