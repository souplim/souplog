import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { BOOK_STATUS_LABELS, todayInSeoul } from '~/lib/book-shelf';
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

export default async function BooksPage() {
  const [books, user] = await Promise.all([getBooks(), getCurrentUser()]);
  const today = todayInSeoul();
  const reading = books.filter((book) => book.status === 'reading');
  const finished = books.filter((book) => book.status === 'done');
  const wishlist = books.filter((book) => book.status === 'want');

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

      <ShelfSummary books={books} year={Number(today.slice(0, 4))} />

      <div className="mt-[var(--space-xl)] space-y-[var(--space-section)]">
        <ShelfSection id="reading" title={BOOK_STATUS_LABELS.reading} count={reading.length} empty="지금 읽는 책이 없어요.">
          <ReadingList books={reading} today={today} />
        </ShelfSection>

        <ShelfSection id="finished" title={BOOK_STATUS_LABELS.done} count={finished.length} empty="아직 다 읽은 책이 없어요.">
          <BookShelf books={finished} />
        </ShelfSection>

        <ShelfSection
          id="wishlist"
          title={BOOK_STATUS_LABELS.want}
          count={wishlist.length}
          empty="읽고 싶은 책을 아직 꽂아두지 않았어요."
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
