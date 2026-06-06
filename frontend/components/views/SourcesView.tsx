import { CheckCircle2, Database, FileJson, ShieldCheck } from "lucide-react";

export function SourcesView() {
  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200/90">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p>
          <strong className="text-emerald-100">Mock mode is active</strong> — safe for testing and
          demos. No real mailbox credentials are required. The agent reads from a local JSON file
          instead of IMAP/Gmail.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Connected Sources</h2>
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-background/40 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <FileJson className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">Mock JSON Inbox Source</h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  mock_data/emails.json
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  9 sample emails including payment failures, server outages, newsletters, and spam.
                  Mapped via <code className="text-foreground/70">MOCK_EMAIL_FILE</code> env var.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-border bg-card/60 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-semibold text-emerald-300">Live</p>
              <p className="text-[10px] text-muted-foreground">Polling on trigger</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Source Type", value: "JSON File" },
            { label: "Env Variable", value: "MOCK_EMAIL_FILE" },
            { label: "Real IMAP", value: "Disabled" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-border/60 bg-background/30 px-4 py-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/20 p-5 text-center">
        <Database className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <h3 className="mt-3 text-sm font-medium text-muted-foreground">Gmail / IMAP (Future)</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          OAuth-connected inbox sources will appear here in production deployments.
        </p>
      </div>
    </div>
  );
}
