'use client';

import { deleteBookAction } from '~/lib/actions/books';
import { ConfirmDeleteDialog } from '~/components/owner/ConfirmDeleteDialog';

interface DeleteBookButtonProps {
  bookId: string;
}

export function DeleteBookButton({ bookId }: DeleteBookButtonProps) {
  return (
    <ConfirmDeleteDialog
      title="이 책을 책장에서 뺄까요?"
      description="읽은 기록과 감상도 함께 지워지고, 되돌릴 수 없습니다."
      onConfirm={() => deleteBookAction(bookId)}
    />
  );
}
