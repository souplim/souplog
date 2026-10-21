'use client';

import { startTransition, useActionState, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { cn } from 'cn';
import type { BookFormState } from '~/lib/actions/books';
import type { BookSearchResult } from '~/lib/book-search';
import { BOOK_STATUSES, BOOK_STATUS_LABELS, todayInSeoul, type BookStatus } from '~/lib/book-shelf';
import type { Book } from '~/lib/supabase/types';
import { BookSearch } from './BookSearch';
import { CoverPicker, type SuggestedCover } from './CoverPicker';
import { RatingInput } from './RatingInput';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Textarea } from '~/components/ui/textarea';

interface BookFormProps {
  book: Book | null;
  action: (prevState: BookFormState | undefined, formData: FormData) => Promise<BookFormState>;
}

export function BookForm({ book, action }: BookFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [publisher, setPublisher] = useState(book?.publisher ?? '');
  const [isbn, setIsbn] = useState(book?.isbn ?? '');
  const [suggestedCover, setSuggestedCover] = useState<SuggestedCover | null>(null);
  const [status, setStatus] = useState<BookStatus>(book?.status ?? 'want');
  const [startedAt, setStartedAt] = useState(book?.started_at ?? '');
  const [finishedAt, setFinishedAt] = useState(book?.finished_at ?? '');
  const [currentPage, setCurrentPage] = useState(String(book?.current_page ?? 0));
  const [rating, setRating] = useState(book?.rating ?? 0);
  const [isPublic, setIsPublic] = useState(book?.is_public ?? true);
  // A new book starts from Kakao search; the form opens once one is picked or the owner opts to type it in.
  const [isSearchStep, setIsSearchStep] = useState(book === null);

  /** A picked search result replaces what it knows; page count isn't in Kakao's data, so it stays. */
  function handlePick(result: BookSearchResult) {
    setTitle(result.title);
    setAuthor(result.author);
    setPublisher(result.publisher);
    setIsbn(result.isbn ?? '');
    setSuggestedCover(
      result.thumbnailUrl && result.coverUrl ? { thumbnailUrl: result.thumbnailUrl, coverUrl: result.coverUrl } : null,
    );
    setIsSearchStep(false);
  }

  /** Fills today into the date the new status needs, unless one is already written. */
  function handleStatusChange(next: BookStatus) {
    setStatus(next);
    const today = todayInSeoul();
    if (next === 'reading' && !startedAt) setStartedAt(today);
    if (next === 'done' && !finishedAt) setFinishedAt(today);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  const cancelHref = book ? `/books/${book.id}` : '/books';

  if (isSearchStep) {
    return (
      <div className="space-y-4">
        <BookSearch onPick={handlePick} autoFocus />
        <p className="text-sm text-muted-foreground">
          찾는 책이 없나요?{' '}
          <button
            type="button"
            onClick={() => setIsSearchStep(false)}
            className="cursor-pointer font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            직접 입력하기
          </button>
        </p>
      </div>
    );
  }

  return (
    // Dispatched from onSubmit for the same reason as PostForm: a form-level
    // `action` resets the form after a failed save, losing the picked cover.
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="isPublic" value={isPublic ? 'on' : ''} />

      <BookSearch onPick={handlePick} />

      <CoverPicker
        initialCover={book?.cover ?? null}
        suggested={suggestedCover}
        onClearSuggested={() => setSuggestedCover(null)}
      />

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} />
      </div>

      <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="author">저자</Label>
          <Input id="author" name="author" value={author} onChange={(event) => setAuthor(event.target.value)} maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="publisher">출판사</Label>
          <Input id="publisher" name="publisher" value={publisher} onChange={(event) => setPublisher(event.target.value)} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalPages">전체 쪽수</Label>
          <Input
            id="totalPages"
            name="totalPages"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={book?.total_pages ?? ''}
            className="tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            name="isbn"
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
            maxLength={20}
            className="tabular-nums"
          />
        </div>
      </div>

      <StatusPicker value={status} onChange={handleStatusChange} />

      {status !== 'want' && (
        <div className="grid gap-x-4 gap-y-8 rounded-md bg-muted/60 p-4 sm:grid-cols-2 sm:p-5">
          <div className="space-y-2">
            <Label htmlFor="startedAt">시작한 날</Label>
            <Input
              id="startedAt"
              name="startedAt"
              type="date"
              value={startedAt}
              onChange={(event) => setStartedAt(event.target.value)}
            />
          </div>
          {status === 'reading' ? (
            <div className="space-y-2">
              <Label htmlFor="currentPage">읽은 쪽수</Label>
              <Input
                id="currentPage"
                name="currentPage"
                type="number"
                inputMode="numeric"
                min={0}
                value={currentPage}
                onChange={(event) => setCurrentPage(event.target.value)}
                className="tabular-nums"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="finishedAt">다 읽은 날</Label>
                <Input
                  id="finishedAt"
                  name="finishedAt"
                  type="date"
                  value={finishedAt}
                  onChange={(event) => setFinishedAt(event.target.value)}
                />
              </div>
              <RatingInput value={rating} onChange={setRating} />
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="note">한 줄 감상</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={book?.note}
          maxLength={500}
          placeholder="기억하고 싶은 문장이나 느낌을 짧게 남겨요"
          className="min-h-24"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch id="isPublic-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
        <Label htmlFor="isPublic-toggle" className="text-sm">
          책장에 공개
        </Label>
        {!isPublic && <span className="text-xs text-muted-foreground">나만 볼 수 있어요</span>}
      </div>

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-5">
        <Button asChild variant="ghost">
          <Link href={cancelHref}>취소</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? '저장 중…' : '저장'}
        </Button>
      </div>
    </form>
  );
}

interface StatusPickerProps {
  value: BookStatus;
  onChange: (value: BookStatus) => void;
}

/** Three radios drawn as one segmented control. */
function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm leading-none font-medium">상태</legend>
      <div className="inline-flex rounded-md bg-muted p-1 ring-1 ring-border ring-inset">
        {BOOK_STATUSES.map((status) => (
          <label
            key={status}
            className={cn(
              'cursor-pointer rounded-sm px-3.5 py-1.5 text-sm transition-colors duration-[var(--duration-fast)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50',
              value === status
                ? 'bg-card font-semibold text-foreground shadow-[0_1px_2px_oklch(22%_0.012_158/0.1)]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <input
              type="radio"
              name="status"
              value={status}
              checked={value === status}
              onChange={() => onChange(status)}
              className="sr-only"
            />
            {BOOK_STATUS_LABELS[status]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
