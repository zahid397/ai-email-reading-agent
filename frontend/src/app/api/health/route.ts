import { NextResponse } from "next/server";
import { RENDER_BACKEND_URL, type HealthResponse } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MOCK_HEALTH: HealthResponse = { status: "ok" };

export async function GET() {
  if (RENDER_BACKEND_URL) {
    try {
      const res = await fetch(`${RENDER_BACKEND_URL}/health`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const data = (await res.json()) as HealthResponse;
        return NextResponse.json(data, {
          headers: {
            "X-Data-Source": "render",
            "Cache-Control": "no-store",
          },
        });
      }
    } catch (err) {
      console.warn("[health] Render unreachable, using mock.", err);
    }
  }

  return NextResponse.json(MOCK_HEALTH, {
    headers: {
      "X-Data-Source": "mock",
      "Cache-Control": "no-store",
    },
  });
}
