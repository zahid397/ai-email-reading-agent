import { NextRequest, NextResponse } from "next/server";
import { RENDER_BACKEND_URL, type EmailItem } from "@/lib/api";
import { fetchBackendStats, isLiveGroqBackend } from "@/lib/backendProxy";
import { getMockEmails } from "@/lib/mockEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const importantOnly = req.nextUrl.searchParams.get("important_only") !== "false";
  const path = importantOnly ? "/emails" : "/emails?important_only=false";

  const backendStats = await fetchBackendStats();
  if (isLiveGroqBackend(backendStats) && RENDER_BACKEND_URL) {
    try {
      const res = await fetch(`${RENDER_BACKEND_URL}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        const data = (await res.json()) as EmailItem[];
        if (Array.isArray(data) && data.length > 0) {
          return NextResponse.json(data, {
            headers: {
              "X-Data-Source": "render",
              "Cache-Control": "no-store",
            },
          });
        }
      }
    } catch (err) {
      console.warn("[emails] Render unreachable, using mock engine.", err);
    }
  }

  return NextResponse.json(getMockEmails(importantOnly), {
    headers: {
      "X-Data-Source": "mock",
      "Cache-Control": "no-store",
    },
  });
}
