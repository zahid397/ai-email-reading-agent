"use client";

import { useMemo, useState } from "react";
import { Filter, Inbox, Star } from "lucide-react";
import {
  EmailFilters,
  filterEmails,
  type PriorityFilter,
} from "@/components/emails/EmailFilters";
import { EmailList } from "@/components/emails/EmailList";
import type { Email } from "@/lib/email";

export function ImportantEmailsView({
  emails,
  loading,
  error,
}: {
  emails?: Email[];
  loading: boolean;
  error: unknown;
}) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<PriorityFilter>("ALL");
  const [category, setCategory] = useState("ALL");

  const categories = useMemo(() => {
    const set = new Set((emails ?? []).map((e) => e.category));
    return Array.from(set).sort();
  }, [emails]);

  const filtered = useMemo(
    () => filterEmails(emails ?? [], search, priority, category),
    [emails, search, priority, category]
  );

  const hasActiveFilters = Boolean(search) || priority !== "ALL" || category !== "ALL";

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Filters</h2>
        </div>
        <EmailFilters
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          category={category}
          onCategoryChange={setCategory}
          categories={categories}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Important Emails</h2>
          <span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-300">
            {filtered.length} of {emails?.length ?? 0}
          </span>
        </div>
        <EmailList
          emails={filtered}
          loading={loading}
          error={error}
          filtered={hasActiveFilters}
          emptyTitle="No important emails yet"
          emptyDescription="The AI agent hasn't flagged any emails as important. Run the agent or wait for the next scheduled scan."
        />
      </div>

      {!loading && !error && (emails?.length ?? 0) === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/80">
          <Inbox className="h-4 w-4 shrink-0 text-amber-400" />
          <p>
            Important emails are determined by the AI classifier. Click <strong>Run Agent</strong> on
            the dashboard to process the mock inbox.
          </p>
        </div>
      )}
    </div>
  );
}
