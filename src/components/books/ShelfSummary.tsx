import type { ReactNode } from 'react';
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
  /** The owner's controls, set beside the year picker. */
  action?: ReactNode;
}

/**
 * The shelf in one glance: the year up front, that year's three statuses as
 * jump links beneath it, and how its reading spread over its months — with a
 * picker over the chart to switch to another year.
 */
export function ShelfSummary({ books, year, years, currentYear, action }: ShelfSummaryProps) {
  const finished = books.filter((book) => book.status === 'done');
  const months = monthlyFinishedCounts(finished, year);
  const counts = statusCountsInYear(books, year);

  // Narrow: the controls sit beside the year and the chart runs full width
  // below. Wide: year and counts hold the left column, controls over chart on
  // the right.
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-[var(--space-sm)] gap-y-[var(--space-md)] border-b border-border pb-[var(--space-md)] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-[var(--space-lg)] sm:gap-y-[var(--space-xs)]">
      <div className="col-start-1 row-start-1 sm:row-span-2 sm:self-end">
        <p className="font-heading text-[length:var(--text-display)] leading-none font-semibold tracking-[var(--tracking-display)] tabular-nums">
          {year}
        </p>
        <dl className="mt-[var(--space-sm)] flex items-end gap-[var(--space-md)]">
          <SummaryLink href="#finished" label="읽은 책" count={counts.done} />
          <SummaryLink href="#reading" label="읽는 중" count={counts.reading} />
          <SummaryLink href="#wishlist" label="읽고 싶은" count={counts.want} />
        </dl>
      </div>

      {/* The picker only shows with more than one year to offer. */}
      {(years.length > 1 || action) && (
        <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-[var(--space-xs)] self-start sm:self-end">
          {years.length > 1 && <SummaryYearSelect years={years} year={year} currentYear={currentYear} />}
          {action}
        </div>
      )}

      <div className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2">
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
          className="rounded-xs text-[length:var(--text-lg)] font-semibold tabular-nums outline-none transition-colors duration-[var(--duration-fast)] hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {count}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">권</span>
        </a>
      </dd>
    </div>
  );
}
