"use client";

import { Info, Mails } from "lucide-react";
import { EmailList } from "@/components/emails/EmailList";
import type { Email } from "@/lib/email";

export function AllEmailsView({
  emails,
  loading,
  error,
}: {
  emails?: Email[];
  loading: boolean;
  error: unknown;
}) {
  const importantCount = (emails ?? []).filter((e) => e.important).length;
  const nonImportantCount = (emails ?? []).length - importantCount;

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-3 text-sm text-sky-200/90">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
        <div>
          <p className="font-medium text-sky-100">Backend supports all processed emails</p>
          <p className="mt-1 text-xs text-sky-200/70">
            The dashboard and Important view only surface <code className="text-sky-300">important=true</code>{" "}
            emails by design. This page shows every email the agent has processed via{" "}
            <code className="text-sky-300">GET /emails?important_only=false</code>, including{" "}
            {nonImportantCount} non-important {nonImportantCount === 1 ? "entry" : "entries"} filtered
            from the main view.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Mails className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">All Processed Emails</h2>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {emails?.length ?? 0} total
          </span>
        </div>
        <EmailList
          emails={emails}
          loading={loading}
          error={error}
          emptyTitle="No emails processed yet"
          emptyDescription="Run the AI agent to scan the mock inbox. Processed emails will appear here with full classification metadata."
        />
      </div>
    </div>
  );
}
