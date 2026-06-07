import { NextResponse } from "next/server";
import { fetchBackendStats, isLiveGroqBackend } from "@/lib/backendProxy";
import { getMockStats } from "@/lib/mockEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const backendStats = await fetchBackendStats();
  if (isLiveGroqBackend(backendStats) && (backendStats!.total_processed ?? 0) > 0) {
    return NextResponse.json(backendStats, {
      headers: {
        "X-Data-Source": "render",
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(getMockStats(), {
    headers: {
      "X-Data-Source": "mock",
      "Cache-Control": "no-store",
    },
  });
}
