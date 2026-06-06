import { Mail } from "lucide-react";
import { type Email, categoryBadge, priorityStyle } from "@/lib/email";
import { avatarColor, cn, initials, timeAgo } from "@/lib/utils";

/** Premium notification card — displays the 6 required assignment fields. */
export function EmailCard({ email }: { email: Email }) {
  const p = priorityStyle(email.priority);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-4 sm:p-5",
        "transition-all duration-300 hover:border-white/20 hover:bg-slate-900/90",
        "shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
        p.border,
        "border-l-[3px]"
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        {/* 1. Sender */}
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-center sm:gap-1.5">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-xs font-bold",
              avatarColor(email.sender)
            )}
          >
            {initials(email.sender)}
          </div>
          <div className="min-w-0 sm:text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Sender</p>
            <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-300 sm:max-w-[100px]">
              <Mail className="h-3 w-3 shrink-0 text-slate-500" />
              <span className="truncate">{email.sender}</span>
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {/* Header: Subject + Priority + Time */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Subject
              </p>
              {/* 2. Subject */}
              <h3 className="mt-0.5 text-base font-bold leading-snug text-white">
                {email.subject}
              </h3>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* 3. Priority */}
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Priority
                </p>
                <span
                  className={cn(
                    "mt-0.5 inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold tracking-wide",
                    p.badge,
                    email.priority === "HIGH" && "priority-pulse-high",
                    email.priority === "MEDIUM" && "shadow-[0_0_12px_rgba(251,191,36,0.3)]",
                    email.priority === "LOW" && "shadow-[0_0_8px_rgba(148,163,184,0.2)]"
                  )}
                >
                  {email.priority}
                </span>
              </div>

              {/* 6. Time Received */}
              <div className="text-right">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  Time Received
                </p>
                <time
                  className="mt-0.5 block text-xs font-medium text-slate-400"
                  dateTime={email.date}
                  title={email.date}
                >
                  {timeAgo(email.date)}
                </time>
              </div>
            </div>
          </div>

          {/* 4. Category */}
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Category
            </p>
            <span
              className={cn(
                "mt-1 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold tracking-wide",
                categoryBadge(email.category)
              )}
            >
              {email.category}
            </span>
          </div>

          {/* 5. AI Reason */}
          <div className="rounded-xl border border-white/5 bg-slate-800/50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">
              AI Reasoning:
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{email.reason}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
