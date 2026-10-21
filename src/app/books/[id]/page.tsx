import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getCurrentUser } from '~/lib/auth';
import { BOOK_STATUS_LABELS, daysSince, todayInSeoul } from '~/lib/book-shelf';
import { getBookById } from '~/lib/books';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import type { Book } from '~/lib/supabase/types';
import { BookCover } from '~/components/books/BookCover';
import { BookProgressControls } from '~/components/books/BookProgressControls';
import { DeleteBookButton } from '~/components/books/DeleteBookButton';
import { ReadingProgress } from '~/components/books/ReadingProgress';
import { StarRating } from '~/components/books/StarRating';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { id } = await params;
  // RLS returns null for a hidden book unless the owner is asking.
  const book = await getBookById(id);
  if (!book) return { title: '책을 찾을 수 없습니다' };

  const description = book.note || [book.author, BOOK_STATUS_LABELS[book.status]].filter(Boolean).join(' · ');
  return {
    title: book.title,
    description,
    openGraph: {
      title: book.title,
      description,
      images: book.cover ? [getPostImageUrl(book.cover.path)] : undefined,
    },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const [book, user] = await Promise.all([getBookById(id), getCurrentUser()]);
  if (!book) notFound();

  const isOwner = Boolean(user);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <div className="mx-auto w-full max-w-[var(--content-width)]">
        <Link
          href="/books"
          className="inline-flex items-center gap-1 rounded-xs text-sm text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          책장
        </Link>

        <article className="mt-[var(--space-md)] grid gap-[var(--space-md)] sm:grid-cols-[11rem_1fr] sm:gap-[var(--space-lg)]">
          <BookCover
            title={book.title}
            cover={book.cover}
            sizes="(min-width: 40rem) 176px, 160px"
            className="w-40 sm:w-44"
            isPriority
          />

          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-accent-foreground">{BOOK_STATUS_LABELS[book.status]}</span>
              {isOwner && !book.is_public && <Badge variant="outline">숨김</Badge>}
            </div>
            <h1 className="font-heading text-[length:var(--text-display)] leading-[var(--leading-tight)] tracking-[-0.03em] text-balance">
              {book.title}
            </h1>
            {(book.author || book.publisher) && (
              <p className="mt-2 text-[length:var(--text-base)] text-muted-foreground">
                {[book.author, book.publisher].filter(Boolean).join(' · ')}
              </p>
            )}

            <BookFacts book={book} />

            {book.note && (
              <blockquote className="mt-[var(--space-md)] border-l-2 border-[var(--color-accent)] pl-4 text-[length:var(--text-base)] leading-[var(--leading-relaxed)] text-pretty">
                {book.note}
              </blockquote>
            )}

            {isOwner && (
              <div className="mt-[var(--space-lg)] space-y-4 border-t border-border pt-5">
                <BookProgressControls
                  bookId={book.id}
                  status={book.status}
                  currentPage={book.current_page}
                  totalPages={book.total_pages}
                />
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/books/${book.id}/edit`}>
                      <Pencil />
                      수정
                    </Link>
                  </Button>
                  <DeleteBookButton bookId={book.id} />
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

/** Only the facts the book's status has — a wished book shows just its length. */
function BookFacts({ book }: { book: Book }) {
  const today = todayInSeoul();

  return (
    <dl className="mt-[var(--space-md)] grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 text-sm">
      {book.status === 'reading' && (
        <>
          <dt className="text-muted-foreground">진행</dt>
          <dd className="max-w-64">
            <ReadingProgress currentPage={book.current_page} totalPages={book.total_pages} />
          </dd>
        </>
      )}
      {book.started_at && (
        <>
          <dt className="text-muted-foreground">시작한 날</dt>
          <dd className="tabular-nums">
            {formatDate(book.started_at)}
            {book.status === 'reading' && (
              <span className="ml-2 text-muted-foreground">{daysSince(book.started_at, today)}일째</span>
            )}
          </dd>
        </>
      )}
      {book.finished_at && (
        <>
          <dt className="text-muted-foreground">다 읽은 날</dt>
          <dd className="tabular-nums">{formatDate(book.finished_at)}</dd>
        </>
      )}
      {book.total_pages && (
        <>
          <dt className="text-muted-foreground">쪽수</dt>
          <dd className="tabular-nums">{book.total_pages.toLocaleString('ko-KR')}쪽</dd>
        </>
      )}
      {book.rating && (
        <>
          <dt className="text-muted-foreground">별점</dt>
          <dd>
            <StarRating rating={book.rating} />
          </dd>
        </>
      )}
    </dl>
  );
}
