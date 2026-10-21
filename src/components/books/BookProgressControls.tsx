'use client';

import { useTransition } from 'react';
import { BookCheck, BookOpen } from 'lucide-react';
import { changeBookStatusAction } from '~/lib/actions/books';
import type { BookStatus } from '~/lib/book-shelf';
import { Button } from '~/components/ui/button';

interface BookProgressControlsProps {
  bookId: string;
  status: BookStatus;
}

/**
 * The owner's one-tap moves along want → reading → done. Anything else
 * (dates, rating, going back) is the edit form's job.
 */
export function BookProgressControls({ bookId, status }: BookProgressControlsProps) {
  const [isChanging, startTransition] = useTransition();

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
    <Button type="button" onClick={() => moveTo('done')} disabled={isChanging}>
      <BookCheck />
      {isChanging ? '기록 중…' : '다 읽음'}
    </Button>
  );
}
