'use client';

import { useActionState, useTransition } from 'react';
import { BookCheck, BookOpen } from 'lucide-react';
import { changeBookStatusAction, updateBookPageAction } from '~/lib/actions/books';
import type { BookStatus } from '~/lib/book-shelf';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface BookProgressControlsProps {
  bookId: string;
  status: BookStatus;
  currentPage: number;
  totalPages: number | null;
}

/**
 * The owner's one-tap moves along want → reading → done, plus the bookmark
 * while reading. Anything else (dates, rating, going back) is the edit form's job.
 */
export function BookProgressControls({ bookId, status, currentPage, totalPages }: BookProgressControlsProps) {
  const [isChanging, startTransition] = useTransition();
  const [pageState, pageAction, isSavingPage] = useActionState(updateBookPageAction.bind(null, bookId), undefined);

  function moveTo(next: BookStatus) {
    startTransition(() => changeBookStatusAction(bookId, next));
  }

  if (status === 'want') {
    return (
      <Button type="button" onClick={() => moveTo('reading')} disabled={isChanging}>
        <BookOpen />
        {isChanging ? '기록 중…' : '읽기 시작'}
      </Button>
    );
  }

  if (status === 'done') return null;

  return (
    <div className="flex flex-wrap items-end gap-2">
      <form action={pageAction} className="flex items-end gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="currentPage" className="text-xs text-muted-foreground">
            읽은 쪽수
          </Label>
          <Input
            id="currentPage"
            name="currentPage"
            type="number"
            inputMode="numeric"
            min={0}
            max={totalPages ?? undefined}
            defaultValue={currentPage}
            className="w-24 tabular-nums"
            aria-describedby={pageState?.error ? 'currentPage-error' : undefined}
          />
        </div>
        <Button type="submit" variant="outline" disabled={isSavingPage}>
          {isSavingPage ? '저장 중…' : '저장'}
        </Button>
      </form>
      <Button type="button" onClick={() => moveTo('done')} disabled={isChanging}>
        <BookCheck />
        {isChanging ? '기록 중…' : '다 읽음'}
      </Button>
      {pageState?.error && (
        <p id="currentPage-error" role="alert" className="basis-full text-xs text-destructive">
          {pageState.error}
        </p>
      )}
    </div>
  );
}
