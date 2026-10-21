import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { BOOK_STATUS_LABELS, resolveSummaryYear, summaryYearOf, summaryYears, todayInSeoul } from '~/lib/book-shelf';
import { getBooks } from '~/lib/books';
import { BookShelf } from '~/components/books/BookShelf';
import { ReadingList } from '~/components/books/ReadingList';
import { ShelfSummary } from '~/components/books/ShelfSummary';
import { Wishlist } from '~/components/books/Wishlist';
import { PageTitle } from '~/components/page/PageHeading';
import { Button } from '~/components/ui/button';

export const metadata: Metadata = {
  title: '책장',
  description: '읽고 싶은 책, 읽는 중인 책, 읽은 책',
};

interface BooksPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const [books, user, params] = await Promise.all([getBooks(), getCurrentUser(), searchParams]);
  const today = todayInSeoul();
  const currentYear = Number(today.slice(0, 4));
  const years = summaryYears(books, currentYear);
  const summaryYear = resolveSummaryYear(params.year, years, currentYear);
  // The sections below follow the year picked in the summary.
  const booksInYear = books.filter((book) => summaryYearOf(book) === summaryYear);
  const reading = booksInYear.filter((book) => book.status === 'reading');
  const finished = booksInYear.filter((book) => book.status === 'done');
  const wishlist = booksInYear.filter((book) => book.status === 'want');

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <header className="mb-[var(--space-lg)] flex items-end justify-between gap-4">
        <PageTitle>책장</PageTitle>
        {user && (
          <Button asChild size="sm">
            <Link href="/admin/books/new">
              <Plus />
              책 추가
            </Link>
          </Button>
        )}
      </header>

      <ShelfSummary books={books} year={summaryYear} years={years} currentYear={currentYear} />

      <div className="mt-[var(--space-xl)] space-y-[var(--space-section)]">
        <ShelfSection id="reading" title={BOOK_STATUS_LABELS.reading} count={reading.length} empty={`${summaryYear}년에 읽기 시작한 책이 없어요.`}>
          <ReadingList books={reading} today={today} />
        </ShelfSection>

        <ShelfSection id="finished" title={BOOK_STATUS_LABELS.done} count={finished.length} empty={`${summaryYear}년에 다 읽은 책이 없어요.`}>
          <BookShelf books={finished} />
        </ShelfSection>

        <ShelfSection
          id="wishlist"
          title={BOOK_STATUS_LABELS.want}
          count={wishlist.length}
          empty={`${summaryYear}년에 꽂아둔 읽고 싶은 책이 없어요.`}
        >
          <Wishlist books={wishlist} />
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
      <h2 id={`${id}-heading`} className="mb-[var(--space-md)] flex items-baseline gap-2 font-heading text-[length:var(--text-title)] tracking-[var(--tracking-tight)]">
        {title}
        <span className="text-sm font-normal tabular-nums text-muted-foreground">{count}</span>
      </h2>
      {count > 0 ? children : <p className="text-sm text-muted-foreground">{empty}</p>}
    </section>
  );
}
