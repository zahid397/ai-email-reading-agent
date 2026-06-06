"use client";

import { Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Email } from "@/lib/email";
import { priorityStyle } from "@/lib/email";
import { cn, timeAgo } from "@/lib/utils";

function recentImportant(emails?: Email[]): Email[] {
  if (!emails?.length) return [];
  return [...emails]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
}

export function NotificationBell({
  important,
  count,
}: {
  important?: Email[];
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const recent = useMemo(() => recentImportant(important), [important]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${count > 0 ? `, ${count} important` : ""}`}
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground",
          open && "bg-muted/50 text-foreground"
        )}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl shadow-black/40"
        >
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Notifications</p>
            <p className="text-xs text-slate-400">
              {count > 0
                ? `${count} important email${count !== 1 ? "s" : ""}`
                : "No new notifications"}
            </p>
          </div>

          {recent.length > 0 ? (
            <ul className="max-h-72 divide-y divide-white/5 overflow-y-auto">
              {recent.map((email) => {
                const p = priorityStyle(email.priority);
                return (
                  <li key={email.email_id}>
                    <div className="px-4 py-3 transition-colors hover:bg-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-xs font-medium text-slate-300">
                          {email.sender}
                        </p>
                        <span className="shrink-0 text-[10px] text-slate-500">
                          {timeAgo(email.date)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white">
                        {email.subject}
                      </p>
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          p.badge
                        )}
                      >
                        {email.priority}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-sm font-medium text-slate-300">
                No new notifications
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Important emails will appear here after the agent scans your inbox.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
