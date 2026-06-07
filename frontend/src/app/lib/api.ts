// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE: API_BASE, endpoint(), safeFetcher, apiPost
// SERVER-SIDE: RENDER_BACKEND_URL, fetchWithFallback, mock data
// ─────────────────────────────────────────────────────────────

// ── Client env ───────────────────────────────────────────────
// Empty string = same-origin Next.js /api/* routes (Vercel default)
// Set NEXT_PUBLIC_BACKEND_URL to bypass Next.js routes entirely
export const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

// ── Server env (only available in API routes, not browser) ───
// Set RENDER_BACKEND_URL in Vercel dashboard + .env.local
// Vercel: RENDER_BACKEND_URL=https://ai-email-reading-agent.onrender.com
// Docker: RENDER_BACKEND_URL=http://backend:8000
// Local:  RENDER_BACKEND_URL=http://localhost:8000
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

// ─────────────────────────────────────────────────────────────
// CLIENT HELPERS
// ─────────────────────────────────────────────────────────────

// endpoint("/health")
//   API_BASE = ""                 → "/api/health"   (same-origin)
//   API_BASE = "http://..."       → "http://.../health"
export function endpoint(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return API_BASE === "" ? `/api${p}` : `${API_BASE}${p}`;
}

// SWR fetcher — MUST THROW on error (never return {error})
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

// POST helper
export async function apiPost<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    throw new Error(`Network error on POST: ${String(err)}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} on POST`);
  try {
    return (await res.json()) as T;
  } catch {
    throw new Error("Invalid JSON in POST response");
  }
}

// ─────────────────────────────────────────────────────────────
// MOCK DATA — pre-classified fallback (used by API routes)
// ─────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();

export const MOCK_EMAILS: EmailItem[] = [
  {
    email_id: "email_001_payment_failed",
    sender: "billing@paysecure.com",
    subject: "Payment failed for Invoice #INV-2287",
    body: "Your payment for invoice #INV-2287 has failed. The card on file was declined. Please update your payment method within 48 hours to avoid service interruption.",
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
    body: "Your EC2 instance i-0abcd1234 is in a stopped state since 10:15 AM UTC. Production traffic is affected. Immediate action required.",
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
    body: "A customer reported that they cannot login to their account since this morning. They are getting a 403 error and are quite frustrated.",
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
    body: "Thank you for your application. We were impressed with your submission and would like to invite you to a technical interview next week.",
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
    body: "We detected a new login to your account from an unrecognized device. If this was not you, reset your password immediately.",
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
    body: "Invoice INV-0481 for your monthly hosting plan is now past due. Please settle the outstanding balance to avoid suspension.",
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
    body: "Your subscription has been renewed successfully. No action needed. Next renewal: July 4, 2026.",
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
    body: "This week in tech: AI breakthroughs, new developer tools. Plus a special discount on our annual plan. Unsubscribe anytime.",
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
    body: "You have been selected as a lottery winner! Claim prize within 24 hours to receive free money and a crypto giveaway.",
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
// SERVER-SIDE FETCH UTILITY
// Only call this from Next.js API routes — never from client
// ─────────────────────────────────────────────────────────────

export interface FetchResult<T> {
  data: T;
  source: "render" | "mock";
  error?: string;
}

// Tries the live Render backend.
// On any failure (timeout, CORS, 5xx, network error) returns
// mockData so the API route always responds with valid JSON.
export async function fetchWithFallback<T>(
  path: string,
  mockData: T,
  options: {
    method?: "GET" | "POST";
    body?: unknown;
    timeoutMs?: number;
  } = {}
): Promise<FetchResult<T>> {
  const { method = "GET", body, timeoutMs = 9_000 } = options;

  // No render URL configured → skip straight to mock
  if (!RENDER_BACKEND_URL) {
    console.log(`[proxy] No RENDER_BACKEND_URL — using mock for ${path}`);
    return { data: mockData, source: "mock" };
  }

  const url = `${RENDER_BACKEND_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
    console.warn(`[proxy] Timeout after ${timeoutMs}ms — ${url}`);
  }, timeoutMs);

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
      throw new Error(`Render returned HTTP ${res.status}`);
    }

    const data = (await res.json()) as T;
    console.log(`[proxy] Render OK — ${method} ${path}`);
    return { data, source: "render" };

  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[proxy] Render failed (${msg}) — falling back to mock for ${path}`);
    return { data: mockData, source: "mock", error: msg };
  }
}