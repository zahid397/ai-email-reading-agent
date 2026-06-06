import { EmailCard } from "@/components/EmailCard";
import { EmptyState, ErrorState, FilteredEmptyState, SkeletonList } from "@/components/shared/States";
import type { Email } from "@/lib/email";

export function EmailList({
  emails,
  loading,
  error,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  filtered,
}: {
  emails?: Email[];
  loading: boolean;
  error: unknown;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: "inbox" | "sparkles";
  filtered?: boolean;
}) {
  if (error) return <ErrorState />;
  if (loading || !emails) return <SkeletonList />;
  if (emails.length === 0) {
    return filtered ? (
      <FilteredEmptyState />
    ) : (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
      />
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((e, i) => (
        <div
          key={e.email_id}
          className="animate-[fade-in_0.35s_ease-out_both]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <EmailCard email={e} />
        </div>
      ))}
    </div>
  );
}
