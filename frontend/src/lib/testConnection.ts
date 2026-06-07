import { endpoint, API_BASE } from "@/lib/api";
import { addClientLog } from "@/lib/clientLogs";

export interface ConnectionTestResult {
  health: "ok" | "fail" | "pending";
  stats: "ok" | "fail" | "pending";
  emails: "ok" | "fail" | "pending";
  allOk: boolean;
  apiBase: string;
}

async function probeEndpoint(
  label: string,
  path: string
): Promise<"ok" | "fail"> {
  try {
    const url = endpoint(path);
    const r = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const source = r.headers.get("X-Data-Source") ?? "unknown";
    const data = await r.json();
    console.log(`[test] ${label}`, { url, ok: r.ok, source, data });
    addClientLog(
      r.ok ? "info" : "error",
      `Test ${label}: ${r.ok ? "OK" : "FAIL"} (source: ${source})`
    );
    return r.ok ? "ok" : "fail";
  } catch (err) {
    console.error(`[test] ${label} failed`, err);
    addClientLog("error", `Test ${label}: FAIL — ${String(err)}`);
    return "fail";
  }
}

export async function runConnectionTest(): Promise<ConnectionTestResult> {
  addClientLog("info", "Test Connection clicked — probing all endpoints…");

  const result: ConnectionTestResult = {
    health: "pending",
    stats: "pending",
    emails: "pending",
    allOk: false,
    apiBase: API_BASE === "" ? "same-origin (/api/*)" : API_BASE,
  };

  result.health = await probeEndpoint("health", "/health");
  result.stats = await probeEndpoint("stats", "/stats");
  result.emails = await probeEndpoint("emails", "/emails");

  result.allOk =
    result.health === "ok" &&
    result.stats === "ok" &&
    result.emails === "ok";

  addClientLog(
    result.allOk ? "success" : "error",
    `Connection test: health=${result.health} stats=${result.stats} emails=${result.emails}`
  );

  return result;
}
