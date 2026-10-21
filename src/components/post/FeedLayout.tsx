import type { ReactNode } from 'react';

interface FeedSlotProps {
  children: ReactNode;
}

/** The column every post list sits in — the feed, a menu, and their loading states. */
export function FeedContainer({ children }: FeedSlotProps) {
  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 pt-[var(--space-md)] pb-[var(--space-section)] sm:px-6 sm:pt-[var(--space-lg)]">
      {children}
    </div>
  );
}

/** A quiet label above the list ("최근 글", a search result count) — it names the list, it doesn't headline the page. */
export function FeedHeading({ children }: FeedSlotProps) {
  return <h2 className="mb-4 text-xs font-normal tracking-normal text-muted-foreground">{children}</h2>;
}

/** Stands in for the card grid when a list comes back empty. */
export function FeedEmpty({ children }: FeedSlotProps) {
  return <p className="py-12 text-center text-muted-foreground">{children}</p>;
}
