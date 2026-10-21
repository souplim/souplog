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
 * The shelf in one glance: the year up front, that year's three statuses as
 * jump links beneath it, and how its reading spread over its months — with a
 * picker over the chart to switch to another year.
 */
export function ShelfSummary({ books, year, years, currentYear }: ShelfSummaryProps) {
  const finished = books.filter((book) => book.status === 'done');
  const months = monthlyFinishedCounts(finished, year);
  const counts = statusCountsInYear(books, year);

  return (
    <div className="grid gap-[var(--space-md)] border-b border-border pb-[var(--space-md)] sm:grid-cols-[auto_1fr] sm:items-end sm:gap-[var(--space-lg)]">
      <div>
        <p className="font-heading text-[length:var(--text-display)] leading-none font-semibold tracking-[var(--tracking-display)] tabular-nums">
          {year}
        </p>
        <dl className="mt-[var(--space-sm)] flex items-end gap-[var(--space-md)]">
          <SummaryLink href="#finished" label="읽은 책" count={counts.done} />
          <SummaryLink href="#reading" label="읽는 중" count={counts.reading} />
          <SummaryLink href="#wishlist" label="읽고 싶은" count={counts.want} />
        </dl>
      </div>

      <div className="min-w-0">
        {/* With only one year to offer there's nothing to pick. */}
        {years.length > 1 && (
          <div className="mb-[var(--space-xs)] flex justify-end">
            <SummaryYearSelect years={years} year={year} currentYear={currentYear} />
          </div>
        )}
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
