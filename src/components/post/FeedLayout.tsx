import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';

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

interface FeedTitleProps {
  /** Omitted while the route is loading — a bar holds the title's line instead. */
  title?: string;
}

/**
 * Names a menu's list one step louder than the feed's "최근 글" label — enough
 * to tell which menu you're in at a glance — with a way back to every post.
 */
export function FeedTitle({ title }: FeedTitleProps) {
  return (
    <header className="mb-4 flex items-center justify-between gap-4">
      {title ? (
        <h1 className="min-w-0 truncate text-lg leading-[var(--leading-tight)] tracking-normal">{title}</h1>
      ) : (
        <Skeleton className="h-[calc(var(--text-lg)*var(--leading-tight))] w-24" />
      )}
      <Link
        href="/"
        className="inline-flex shrink-0 items-center gap-1 rounded-xs text-xs text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <ArrowLeft aria-hidden className="size-3.5" />
        전체 글
      </Link>
    </header>
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
