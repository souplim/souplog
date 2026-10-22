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
import { getNavLabel, getPageHeading } from '~/lib/menus';
import { PageEyebrow, PageTitle } from '~/components/page/PageHeading';
import { BookShelf } from '~/components/books/BookShelf';
import { ShelfSummary } from '~/components/books/ShelfSummary';
import { Button } from '~/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  const [label, heading] = await Promise.all([getNavLabel('books'), getPageHeading('books')]);
  return { title: label, description: heading.description };
}

interface BooksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const [books, user, params, heading] = await Promise.all([
    getBooks(),
    getCurrentUser(),
    searchParams,
    getPageHeading('books'),
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
      {/* Adding a book is about the whole shelf, not the year, so it sits by the title, outside the summary card.
          Centred on the title rather than the label, since the button is taller than the label. */}
      <header>
        <PageEyebrow>책장</PageEyebrow>
        <div className="flex items-center justify-between gap-[var(--space-sm)]">
          <PageTitle>{heading.title}</PageTitle>
          {user && (
            <Button asChild size="sm" className="shrink-0">
              <Link href="/admin/books/new">
                <Plus />책 추가
              </Link>
            </Button>
          )}
        </div>
        <p className="mt-[var(--space-sm)] max-w-[var(--content-width)] whitespace-pre-line text-muted-foreground text-pretty">
          {heading.description}
        </p>
      </header>

      <div className="mt-[var(--space-xl)]">
        <ShelfSummary books={books} year={summaryYear} years={years} currentYear={currentYear} />
      </div>

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
