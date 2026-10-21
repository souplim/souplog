import { monthlyFinishedCounts } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';

interface ShelfSummaryProps {
  books: Book[];
  year: number;
}

/** Bars never shrink below this, so an empty month still reads as a month. */
const MIN_BAR_PERCENT = 4;
/** Months named under the chart — enough to read the rest by counting. */
const LABELED_MONTHS = [1, 6, 12];

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
  const busiestMonth = Math.max(1, ...months);

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

      <figure className="min-w-0">
        <ol className="flex h-16 items-end gap-1" aria-label={`${year}년 월별로 다 읽은 책`}>
          {months.map((count, index) => (
            <li key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span
                aria-hidden="true"
                className={count > 0 ? 'w-full rounded-t-[2px] bg-[var(--color-accent)]' : 'w-full rounded-t-[2px] bg-muted'}
                style={{ height: `${Math.max(MIN_BAR_PERCENT, (count / busiestMonth) * 100)}%` }}
              />
              <span className="sr-only">
                {index + 1}월 {count}권
              </span>
            </li>
          ))}
        </ol>
        {/* Same 12 cells as the bars, so each label sits under its own month rather than at an even third of the width. */}
        <figcaption className="mt-1.5 flex gap-1 text-[0.6875rem] tabular-nums text-muted-foreground" aria-hidden="true">
          {months.map((_, index) => (
            <span key={index} className="flex-1 text-center whitespace-nowrap">
              {LABELED_MONTHS.includes(index + 1) && `${index + 1}월`}
            </span>
          ))}
        </figcaption>
      </figure>
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
