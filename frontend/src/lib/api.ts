// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE & SERVER-SIDE SHARED API UTILS
// ─────────────────────────────────────────────────────────────

/** Treat common misconfigs (localhost:3000 without /api) as same-origin mode. */
function resolveApiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "").trim();
  if (!raw) return "";

  const normalized = raw.replace(/\/$/, "");
  const lower = normalized.toLowerCase();

  if (
    lower === "http://localhost:3000" ||
    lower === "https://localhost:3000" ||
    lower === "http://127.0.0.1:3000" ||
    lower === "https://127.0.0.1:3000"
  ) {
    return "";
  }

  return normalized;
}

export const API_BASE = resolveApiBase();

export const RENDER_BACKEND_URL =
  process.env.RENDER_BACKEND_URL ?? "";

// ─────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface StatsResponse {
  total_processed: number;
  important_count: number;
  fallback_count: number;
  groq_count: number;
  high_priority_count: number;
  categories: CategoryCount[];
  last_run: string | null;
  total_runs: number;
}

export interface EmailItem {
  email_id: string;
  sender: string;
  subject: string;
  body: string;
  date: string;
  important: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  reason: string;
  classifier_source: "groq" | "fallback";
  created_at: string;
}

export interface TriggerResponse {
  processed: number;
  skipped: number;
  failed: number;
}

export interface FetchResult<T> {
  data: T;
  source: "render" | "mock" | "local";
  error?: string;
}

// ─────────────────────────────────────────────────────────────
// CLIENT HELPERS
// ─────────────────────────────────────────────────────────────

export function endpoint(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE === "" ? `/api${p}` : `${API_BASE}${p}`;
}

export async function safeFetcher<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch (err) {
    throw new Error(`Network error: ${String(err)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }
}

export async function apiPost<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    throw new Error(`Network error on POST: ${String(err)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} on POST — ${url}`);
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("Invalid JSON in POST response");
  }
}

// ─────────────────────────────────────────────────────────────
// SIMPLE LOCAL LOGGING (localStorage)
// ─────────────────────────────────────────────────────────────

const LOG_KEY = "agent_logs";

export function addLog(message: string): void {
  if (typeof window === "undefined") return;
  try {
    const logs = JSON.parse(localStorage.getItem(LOG_KEY) || "[]") as string[];
    logs.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
    if (logs.length > 50) logs.pop();
    localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  } catch {
    /* ignore quota errors */
  }
}

export function getLogs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();

export const MOCK_EMAILS: EmailItem[] = [
  {
    email_id: "email_001_payment_failed",
    sender: "billing@paysecure.com",
    subject: "Payment failed for Invoice #INV-2287",
    body: "Your payment for invoice #INV-2287 has failed. The card on file was declined.",
    date: "2026-06-04T16:18:00Z",
    important: true,
    priority: "HIGH",
    category: "PAYMENT_ISSUE",
    reason: "Payment failure detected — card declined, immediate action required.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_002_server_down",
    sender: "alerts@aws.amazon.com",
    subject: "Server is DOWN — Urgent Action Required",
    body: "Your EC2 instance is unreachable. Production traffic is affected.",
    date: "2026-06-04T16:12:00Z",
    important: true,
    priority: "HIGH",
    category: "SERVER_DOWN",
    reason: "Production server outage detected — service is unreachable.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_003_client_complaint",
    sender: "support@yourapp.com",
    subject: "Urgent: Customer cannot access account",
    body: "A customer reported that they cannot login since this morning.",
    date: "2026-06-04T16:05:00Z",
    important: true,
    priority: "HIGH",
    category: "CLIENT_COMPLAINT",
    reason: "Customer access blocked — urgent support required.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_004_interview",
    sender: "careers@tqtech.ie",
    subject: "Interview invitation — Software Engineer 2",
    body: "We would like to invite you to a technical interview next week.",
    date: "2026-06-04T14:05:00Z",
    important: true,
    priority: "HIGH",
    category: "INTERVIEW",
    reason: "Interview invitation from hiring team — response required.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_005_security",
    sender: "security@authguard.com",
    subject: "Security alert: new login to your account",
    body: "We detected a new login from an unrecognized device.",
    date: "2026-06-04T11:40:00Z",
    important: true,
    priority: "HIGH",
    category: "SECURITY",
    reason: "Unrecognized login detected — potential account compromise.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_006_billing",
    sender: "billing@cloudhost.io",
    subject: "Invoice INV-0481 is overdue",
    body: "Invoice INV-0481 is now past due. Please settle the balance.",
    date: "2026-06-03T16:40:00Z",
    important: true,
    priority: "HIGH",
    category: "BILLING_ISSUE",
    reason: "Overdue invoice — service suspension risk if unpaid.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_007_subscription",
    sender: "noreply@saasapp.com",
    subject: "Subscription renewal successful",
    body: "Your subscription has been renewed successfully.",
    date: "2026-06-03T09:30:00Z",
    important: false,
    priority: "LOW",
    category: "SUBSCRIPTION",
    reason: "Automated subscription confirmation — no action required.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_008_newsletter",
    sender: "newsletter@techweekly.com",
    subject: "Weekly newsletter — June 2026",
    body: "This week in tech: AI breakthroughs, new developer tools.",
    date: "2026-06-02T08:00:00Z",
    important: false,
    priority: "LOW",
    category: "NEWSLETTER",
    reason: "Newsletter/promotional content — low priority.",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "email_009_spam",
    sender: "rewards@luckydraw-prizes.net",
    subject: "Congratulations WINNER! Claim your prize now",
    body: "You have been selected as a lottery winner!",
    date: "2026-06-01T22:13:00Z",
    important: false,
    priority: "LOW",
    category: "SPAM",
    reason: "Spam/lottery scam — automatically discarded.",
    classifier_source: "fallback",
    created_at: NOW,
  },
];

export const MOCK_STATS: StatsResponse = {
  total_processed: 9,
  important_count: 6,
  fallback_count: 9,
  groq_count: 0,
  high_priority_count: 6,
  categories: [
    { name: "PAYMENT_ISSUE", count: 1 },
    { name: "SERVER_DOWN", count: 1 },
    { name: "CLIENT_COMPLAINT", count: 1 },
    { name: "INTERVIEW", count: 1 },
    { name: "SECURITY", count: 1 },
    { name: "BILLING_ISSUE", count: 1 },
    { name: "SUBSCRIPTION", count: 1 },
    { name: "NEWSLETTER", count: 1 },
    { name: "SPAM", count: 1 },
  ],
  last_run: NOW,
  total_runs: 1,
};

export const MOCK_TRIGGER: TriggerResponse = {
  processed: 9,
  skipped: 0,
  failed: 0,
};

// ─────────────────────────────────────────────────────────────
// SERVER-SIDE FETCH WITH FALLBACK
// ─────────────────────────────────────────────────────────────

export function isEmptyStats(data: StatsResponse): boolean {
  return (data.total_processed ?? 0) === 0;
}

export function isEmptyEmails(data: EmailItem[]): boolean {
  return !Array.isArray(data) || data.length === 0;
}

function shouldUseMockForPath<T>(
  path: string,
  data: T,
  useMockIfEmpty?: (data: T) => boolean
): boolean {
  if (useMockIfEmpty?.(data)) return true;
  if (path.includes("/stats") && isEmptyStats(data as StatsResponse)) return true;
  if (path.includes("/emails") && isEmptyEmails(data as EmailItem[])) return true;
  return false;
}

export async function fetchWithFallback<T>(
  path: string,
  mockData: T,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    timeoutMs?: number;
    useMockIfEmpty?: (data: T) => boolean;
  } = {}
): Promise<FetchResult<T>> {
  const { method = "GET", body, timeoutMs = 8_000, useMockIfEmpty } = options;

  if (!RENDER_BACKEND_URL) {
    console.log(`[proxy] No RENDER_BACKEND_URL — local mock for ${path}`);
    return { data: mockData, source: "local" };
  }

  const url = `${RENDER_BACKEND_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as T;

    if (shouldUseMockForPath(path, data, useMockIfEmpty)) {
      console.log(
        `[proxy] Backend empty for ${path} — forcing mock data for demo`
      );
      return {
        data: mockData,
        source: "mock",
        error: "Backend returned empty payload",
      };
    }

    console.log(`[proxy] Render OK — ${method} ${path}`);
    return { data, source: "render" };
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[proxy] Render failed (${msg}) — mock fallback for ${path}`);
    return { data: mockData, source: "mock", error: msg };
  }
}
