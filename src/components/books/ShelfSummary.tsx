import { monthlyFinishedCounts } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';

import { MonthlyFinishedChart } from './MonthlyFinishedChart';

interface ShelfSummaryProps {
  books: Book[];
  year: number;
}

/**
 * The shelf in one glance: this year's count up front, the other two
 * statuses as jump links, and how the year's reading spread over its months.
 */
export function ShelfSummary({ books, year }: ShelfSummaryProps) {
  const finished = books.filter((book) => book.status === 'done');
  const months = monthlyFinishedCounts(finished, year);
  const finishedThisYear = months.reduce((sum, count) => sum + count, 0);
  const readingCount = books.filter((book) => book.status === 'reading').length;
  const wantCount = books.filter((book) => book.status === 'want').length;

  return (
    <div className="grid gap-[var(--space-md)] border-y border-border py-[var(--space-md)] sm:grid-cols-[auto_1fr] sm:items-end sm:gap-[var(--space-lg)]">
      <dl className="flex items-end gap-[var(--space-md)]">
        <div>
          <dt className="text-xs text-muted-foreground">{year}년에 읽은 책</dt>
          <dd className="mt-1 font-heading text-[length:var(--text-display)] leading-none font-semibold tracking-[var(--tracking-display)] tabular-nums">
            {finishedThisYear}
            <span className="ml-1 text-[length:var(--text-base)] font-normal text-muted-foreground">권</span>
          </dd>
        </div>
        <SummaryLink href="#reading" label="읽는 중" count={readingCount} />
        <SummaryLink href="#wishlist" label="읽고 싶은" count={wantCount} />
      </dl>

      <MonthlyFinishedChart months={months} year={year} />
    </div>
  );
}

interface SummaryLinkProps {
  href: string;
  label: string;
  count: number;
}

function SummaryLink({ href, label, count }: SummaryLinkProps) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <a
          href={href}
          className="rounded-xs text-[length:var(--text-lg)] font-semibold tabular-nums outline-none transition-colors duration-[var(--duration-fast)] hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {count}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">권</span>
        </a>
      </dd>
    </div>
  );
}
