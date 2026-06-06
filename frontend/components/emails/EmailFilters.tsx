"use client";

import { Search, X } from "lucide-react";
import { categoryLabel } from "@/lib/email";
import { cn } from "@/lib/utils";

export type PriorityFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

export function EmailFilters({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  categories,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  priority: PriorityFilter;
  onPriorityChange: (v: PriorityFilter) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categories: string[];
}) {
  const hasFilters = search || priority !== "ALL" || category !== "ALL";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sender, subject, or body..."
          className="w-full rounded-xl border border-border bg-background/60 py-2 pl-9 pr-3 text-sm outline-none ring-primary/30 transition-shadow placeholder:text-muted-foreground focus:ring-2"
        />
      </div>

      <select
        value={priority}
        onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
        className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
      >
        <option value="ALL">All priorities</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm outline-none ring-primary/30 focus:ring-2"
      >
        <option value="ALL">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {categoryLabel(c)}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => {
            onSearchChange("");
            onPriorityChange("ALL");
            onCategoryChange("ALL");
          }}
          className={cn(
            "flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs text-muted-foreground",
            "transition-colors hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}

export function filterEmails<T extends { sender: string; subject: string; body: string; priority: string; category: string }>(
  emails: T[],
  search: string,
  priority: PriorityFilter,
  category: string
): T[] {
  const q = search.trim().toLowerCase();
  return emails.filter((e) => {
    if (priority !== "ALL" && e.priority !== priority) return false;
    if (category !== "ALL" && e.category !== category) return false;
    if (!q) return true;
    return (
      e.sender.toLowerCase().includes(q) ||
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
    );
  });
}
