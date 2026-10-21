import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import {
  BOOK_STATUS_LABELS,
  daysSince,
  resolveSummaryYear,
  sortByFinishedDate,
  summaryYearOf,
  summaryYears,
  todayInSeoul,
} from '~/lib/book-shelf';
import { getBooks } from '~/lib/books';
import { getNavLabel } from '~/lib/menus';
import { BookShelf } from '~/components/books/BookShelf';
import { ShelfSummary } from '~/components/books/ShelfSummary';
import { Button } from '~/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: await getNavLabel('books'),
    description: '읽고 싶은 책, 읽는 중인 책, 읽은 책',
  };
}

interface BooksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const [books, user, params, title] = await Promise.all([
    getBooks(),
    getCurrentUser(),
    searchParams,
    getNavLabel('books'),
  ]);
  const today = todayInSeoul();
  const currentYear = Number(today.slice(0, 4));
  const years = summaryYears(books, currentYear);
  const summaryYear = resolveSummaryYear(params.year, years, currentYear);
  // The sections below follow the year picked in the summary.
  const booksInYear = books.filter((book) => summaryYearOf(book) === summaryYear);
  const reading = booksInYear.filter((book) => book.status === 'reading');
  const finished = sortByFinishedDate(booksInYear.filter((book) => book.status === 'done'));
  const wishlist = booksInYear.filter((book) => book.status === 'want');

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      {/* The header nav already marks this page, so the name is only announced, not shown. */}
      <h1 className="sr-only">{title}</h1>

      <ShelfSummary
        books={books}
        year={summaryYear}
        years={years}
        currentYear={currentYear}
        action={
          user && (
            <Button asChild size="sm">
              <Link href="/admin/books/new">
                <Plus />책 추가
              </Link>
            </Button>
          )
        }
      />

      <div className="mt-[var(--space-xl)] space-y-[var(--space-section)]">
        <ShelfSection
          id="reading"
          title={BOOK_STATUS_LABELS.reading}
          count={reading.length}
          empty={`${summaryYear}년에 읽기 시작한 책이 없어요.`}
        >
          <BookShelf
            books={reading}
            renderNote={(book) => (book.started_at ? `${daysSince(book.started_at, today)}일째` : null)}
            isPriority
          />
        </ShelfSection>

        <ShelfSection
          id="finished"
          title={BOOK_STATUS_LABELS.done}
          count={finished.length}
          empty={`${summaryYear}년에 다 읽은 책이 없어요.`}
        >
          <BookShelf books={finished} />
        </ShelfSection>

        <ShelfSection
          id="wishlist"
          title={BOOK_STATUS_LABELS.want}
          count={wishlist.length}
          empty={`${summaryYear}년에 꽂아둔 읽고 싶은 책이 없어요.`}
        >
          <BookShelf books={wishlist} />
        </ShelfSection>
      </div>
    </div>
  );
}

interface ShelfSectionProps {
  id: string;
  title: string;
  count: number;
  empty: string;
  children: ReactNode;
}

function ShelfSection({ id, title, count, empty, children }: ShelfSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <h2
        id={`${id}-heading`}
        className="mb-[var(--space-md)] flex items-baseline gap-2 font-heading text-[length:var(--text-title)] tracking-[var(--tracking-tight)]"
      >
        {title}
        <span className="text-sm font-normal tabular-nums text-muted-foreground">{count}</span>
      </h2>
      {count > 0 ? children : <p className="text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}
