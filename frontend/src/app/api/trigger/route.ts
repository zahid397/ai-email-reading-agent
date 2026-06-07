import { NextResponse } from "next/server";
import { fetchBackendStats, fetchBackendTrigger, isLiveGroqBackend } from "@/lib/backendProxy";
import { processNextMockBatch } from "@/lib/mockEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function runTrigger(): Promise<{
  data: ReturnType<typeof processNextMockBatch>;
  source: "render" | "mock";
}> {
  const backendStats = await fetchBackendStats();
  if (isLiveGroqBackend(backendStats)) {
    const data = await fetchBackendTrigger();
    if (data && (data.processed ?? 0) > 0) {
      return { data, source: "render" };
    }
  }

  return { data: processNextMockBatch(), source: "mock" };
}

export async function POST() {
  const { data, source } = await runTrigger();
  return NextResponse.json(data, {
    headers: {
      "X-Data-Source": source,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET() {
  const { data, source } = await runTrigger();
  return NextResponse.json(
    { ok: true, ...data },
    {
      headers: {
        "X-Data-Source": source,
        "Cache-Control": "no-store",
      },
    }
  );
}
