'use client';

import { deletePostAction } from '~/lib/actions/posts';
import { ConfirmDeleteDialog } from '~/components/owner/ConfirmDeleteDialog';

interface DeletePostButtonProps {
  postId: string;
}

export function DeletePostButton({ postId }: DeletePostButtonProps) {
  return (
    <ConfirmDeleteDialog
      title="이 글을 삭제할까요?"
      description="되돌릴 수 없습니다."
      onConfirm={() => deletePostAction(postId)}
    />
  );
}
