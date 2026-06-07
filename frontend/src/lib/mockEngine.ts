import type { EmailItem, StatsResponse, TriggerResponse } from "@/lib/api";

export const MOCK_INBOX_SIZE = 14;
export const MOCK_BATCH_SIZE = 3;
export const MOCK_INITIAL_SEED = 4;

const NOW = new Date().toISOString();

export const MOCK_INBOX: EmailItem[] = [
  {
    email_id: "m_01",
    sender: "billing@aws.com",
    subject: "Server DOWN",
    body: "EC2 instance stopped.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "SERVER_DOWN",
    reason: "Production outage",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_02",
    sender: "security@bank.com",
    subject: "Suspicious Login",
    body: "New login detected.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "SECURITY",
    reason: "Security risk",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_03",
    sender: "support@stripe.com",
    subject: "Payment Failed",
    body: "Card declined.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "PAYMENT_ISSUE",
    reason: "Billing failure",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_04",
    sender: "client@vip.com",
    subject: "App Crashing",
    body: "Cannot access portal.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "CLIENT_COMPLAINT",
    reason: "VIP issue",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_05",
    sender: "alerts@github.com",
    subject: "Secret Exposed",
    body: "API key leaked.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "SECURITY",
    reason: "Key leak",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_06",
    sender: "hosting@vercel.com",
    subject: "Usage Limit Exceeded",
    body: "Approaching limits.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "BILLING_ISSUE",
    reason: "Resource warning",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_07",
    sender: "ceo@company.com",
    subject: "URGENT: Board Meeting",
    body: "Need reports now.",
    date: NOW,
    important: true,
    priority: "HIGH",
    category: "MEETING",
    reason: "Executive request",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_08",
    sender: "hr@tech.ie",
    subject: "Interview Invitation",
    body: "Next week slot.",
    date: NOW,
    important: true,
    priority: "MEDIUM",
    category: "INTERVIEW",
    reason: "Job opportunity",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_09",
    sender: "dev@team.com",
    subject: "Feature Request",
    body: "Can we add dark mode?",
    date: NOW,
    important: true,
    priority: "LOW",
    category: "FEATURE_REQUEST",
    reason: "User feedback",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_10",
    sender: "news@ai.com",
    subject: "Weekly AI Digest",
    body: "News inside.",
    date: NOW,
    important: false,
    priority: "LOW",
    category: "NEWSLETTER",
    reason: "Promo",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_11",
    sender: "noreply@app.com",
    subject: "Subscription Renewed",
    body: "Auto-renewed.",
    date: NOW,
    important: false,
    priority: "LOW",
    category: "SUBSCRIPTION",
    reason: "Automated",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_12",
    sender: "spam@win.net",
    subject: "You Won 1M!",
    body: "Click here.",
    date: NOW,
    important: false,
    priority: "LOW",
    category: "SPAM",
    reason: "Scam",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_13",
    sender: "info@conference.com",
    subject: "Early Bird Tickets",
    body: "Buy now.",
    date: NOW,
    important: false,
    priority: "LOW",
    category: "OTHER",
    reason: "Promo",
    classifier_source: "fallback",
    created_at: NOW,
  },
  {
    email_id: "m_14",
    sender: "marketing@saas.com",
    subject: "Rate our app",
    body: "Please leave a review.",
    date: NOW,
    important: false,
    priority: "LOW",
    category: "OTHER",
    reason: "Feedback request",
    classifier_source: "fallback",
    created_at: NOW,
  },
];

interface MockState {
  processedIds: Set<string>;
  processedEmails: EmailItem[];
  lastRun: string | null;
  totalRuns: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __emailAgentMockStore: MockState | undefined;
}

function seedInitialEmails(store: MockState, count: number): void {
  let seeded = 0;
  for (const email of MOCK_INBOX) {
    if (seeded >= count) break;
    store.processedIds.add(email.email_id);
    store.processedEmails.push({
      ...email,
      created_at: new Date().toISOString(),
    });
    seeded++;
  }
  if (seeded > 0) {
    store.lastRun = new Date().toISOString();
  }
}

function createStore(): MockState {
  const store: MockState = {
    processedIds: new Set(),
    processedEmails: [],
    lastRun: null,
    totalRuns: 0,
  };
  seedInitialEmails(store, MOCK_INITIAL_SEED);
  return store;
}

export function getMockState(): MockState {
  if (!globalThis.__emailAgentMockStore) {
    globalThis.__emailAgentMockStore = createStore();
  }
  return globalThis.__emailAgentMockStore;
}

export function resetMockState(): void {
  globalThis.__emailAgentMockStore = createStore();
}

export function processNextMockBatch(
  batchSize = MOCK_BATCH_SIZE
): TriggerResponse {
  const store = getMockState();

  const unprocessed = MOCK_INBOX.filter(
    (email) => !store.processedIds.has(email.email_id)
  );
  const alreadyProcessedBeforeRun = store.processedIds.size;

  if (unprocessed.length === 0) {
    store.lastRun = new Date().toISOString();
    store.totalRuns += 1;
    return { processed: 0, skipped: MOCK_INBOX.length, failed: 0 };
  }

  const batch = unprocessed.slice(0, batchSize);
  let processed = 0;

  for (const email of batch) {
    if (!store.processedIds.has(email.email_id)) {
      store.processedIds.add(email.email_id);
      store.processedEmails.push({
        ...email,
        created_at: new Date().toISOString(),
      });
      processed++;
    }
  }

  store.lastRun = new Date().toISOString();
  store.totalRuns += 1;

  return {
    processed,
    skipped: alreadyProcessedBeforeRun,
    failed: 0,
  };
}

export function getMockStats(): StatsResponse {
  const store = getMockState();
  const categories = new Map<string, number>();

  for (const email of store.processedEmails) {
    categories.set(email.category, (categories.get(email.category) ?? 0) + 1);
  }

  return {
    total_processed: store.processedEmails.length,
    important_count: store.processedEmails.filter((e) => e.important).length,
    high_priority_count: store.processedEmails.filter(
      (e) => e.priority === "HIGH"
    ).length,
    fallback_count: store.processedEmails.length,
    groq_count: 0,
    categories: Array.from(categories.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    last_run: store.lastRun,
    total_runs: store.totalRuns,
  };
}

export function getMockEmails(importantOnly: boolean): EmailItem[] {
  const store = getMockState();
  const list = importantOnly
    ? store.processedEmails.filter((e) => e.important)
    : store.processedEmails;

  return [...list].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
