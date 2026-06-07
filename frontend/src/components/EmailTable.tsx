import {
  Bot,
  Clock,
  Inbox,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  avatarColor,
  categoryBadge,
  categoryLabel,
  cn,
  formatDate,
  initials,
  priorityBadge,
  priorityBorder,
} from "@/lib/utils";
import type { EmailItem } from "@/lib/api";

interface EmailTableProps {
  emails: EmailItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  view: string;
}

function EmailRow({ email }: { email: EmailItem }) {
  const pri = email.priority;

  return (
    <tr
      className={cn(
        "border-b border-gray-50 hover:bg-gray-50 transition-colors border-l-4 fade-in",
        priorityBorder(pri)
      )}
    >
      {/* Sender */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
              avatarColor(email.sender)
            )}
          >
            {initials(email.sender)}
          </div>
          <span className="text-sm font-medium text-gray-900 truncate max-w-[140px]">
            {email.sender}
          </span>
        </div>
      </td>

      {/* Subject + Body */}
      <td className="px-4 py-4 max-w-xs">
        <p className="text-sm font-medium text-gray-900 truncate">
          {email.subject}
        </p>
        <p
          className="text-xs text-gray-400 mt-0.5"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {email.body}
        </p>
      </td>

      {/* Priority + Category */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              priorityBadge(pri)
            )}
          >
            {pri}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              categoryBadge(email.category)
            )}
          >
            {categoryLabel(email.category)}
          </span>
        </div>
      </td>

      {/* AI Reason */}
      <td className="px-4 py-4 max-w-[200px]">
        <p
          className="text-xs text-gray-600"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {email.reason}
        </p>
      </td>

      {/* Important + Date */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1.5">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              email.important
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-500"
            )}
          >
            {email.important ? "Important" : "Normal"}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(email.date)}</span>
          </div>
        </div>
      </td>

      {/* Source */}
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Bot className="h-3.5 w-3.5 shrink-0" />
          <span className="capitalize">{email.classifier_source}</span>
        </div>
      </td>
    </tr>
  );
}

export function EmailTable({
  emails,
  isLoading,
  isError,
  view,
}: EmailTableProps) {
  const count = emails?.length ?? 0;
  const title = view === "all" ? "All Processed Emails" : "Important Email Notifications";

  return (
    <Card>
      <CardHeader className="justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          {!isLoading && (
            <span className="rounded-full bg-orange-100 text-orange-700 px-2.5 py-0.5 text-xs font-semibold">
              {count}
            </span>
          )}
        </div>
        <button className="text-xs text-gray-400 hover:text-gray-600">
          View all
        </button>
      </CardHeader>

      {/* Error Banner */}
      {isError && (
        <div className="mx-5 mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠ Backend unavailable — Render free tier may be waking up (~50s).
          Emails will appear once the backend responds.
        </div>
      )}

      <CardContent className="px-0 pb-0">
        {isLoading ? (
          <div className="px-5 pb-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
              </div>
            ))}
          </div>
        ) : !emails || emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">
              {view === "all"
                ? "No emails processed yet"
                : "No important emails found"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Run the agent to process and classify emails
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Sender", "Subject", "Priority", "AI Reason", "Status / Date", "Source"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {emails.map((email) => (
                  <EmailRow key={email.email_id} email={email} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
