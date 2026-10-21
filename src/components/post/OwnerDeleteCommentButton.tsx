'use client';

import { deleteCommentAsOwnerAction } from '~/lib/actions/comments';
import { ConfirmDeleteDialog } from '~/components/owner/ConfirmDeleteDialog';

interface OwnerDeleteCommentButtonProps {
  commentId: string;
  postSlug: string;
}

export function OwnerDeleteCommentButton({ commentId, postSlug }: OwnerDeleteCommentButtonProps) {
  return (
    <ConfirmDeleteDialog
      title="이 댓글을 삭제할까요?"
      description="되돌릴 수 없습니다."
      onConfirm={() => deleteCommentAsOwnerAction(postSlug, commentId)}
      triggerSize="icon-xs"
      triggerLabel="관리자 삭제"
    />
  );
}
