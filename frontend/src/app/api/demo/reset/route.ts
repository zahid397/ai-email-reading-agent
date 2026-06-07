import { NextResponse } from "next/server";
import { resetMockState } from "@/lib/mockEngine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  resetMockState();
  return NextResponse.json(
    { ok: true, message: "Mock demo state reset" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
