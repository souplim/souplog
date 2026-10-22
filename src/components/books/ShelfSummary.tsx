import { monthlyFinishedCounts, statusCountsInYear } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';

import { MonthlyFinishedChart } from './MonthlyFinishedChart';
import { SummaryYearSelect } from './SummaryYearSelect';

interface ShelfSummaryProps {
  books: Book[];
  /** The year being summarised. */
  year: number;
  /** Years the select offers, oldest first. */
  years: number[];
  currentYear: number;
}

/**
 * The chosen year's shelf in one glance: its three statuses as jump links,
 * the year picker beside them, and how its reading spread over its months.
 * The page title above names the shelf, so the card holds only the numbers.
 */
export function ShelfSummary({ books, year, years, currentYear }: ShelfSummaryProps) {
  const finished = books.filter((book) => book.status === 'done');
  const months = monthlyFinishedCounts(finished, year);
  const counts = statusCountsInYear(books, year);

  // The counts wrap before the picker does, so on a narrow screen the year
  // stays top right and the chart always runs full width below.
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[var(--space-sm)] gap-y-[var(--space-md)] rounded-xl border border-border bg-card p-[var(--space-md)]">
      <dl className="flex flex-wrap items-end gap-x-[var(--space-md)] gap-y-[var(--space-xs)]">
        <SummaryLink href="#finished" label="읽은 책" count={counts.done} />
        <SummaryLink href="#reading" label="읽는 중" count={counts.reading} />
        <SummaryLink href="#wishlist" label="읽고 싶은" count={counts.want} />
      </dl>

      {/* With one year there is nothing to pick, but the counts still need their year. */}
      {years.length > 1 ? (
        <SummaryYearSelect years={years} year={year} currentYear={currentYear} />
      ) : (
        <p className="text-sm text-muted-foreground tabular-nums">{year}년</p>
      )}

      <div className="col-span-2 min-w-0">
        <MonthlyFinishedChart months={months} year={year} />
      </div>
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
          className="rounded-xs font-heading text-[length:var(--text-title)] leading-none font-semibold tabular-nums outline-none transition-colors duration-[var(--duration-fast)] hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {count}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">권</span>
        </a>
      </dd>
    </div>
  );
}
