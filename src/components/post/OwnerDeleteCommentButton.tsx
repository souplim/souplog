'use client';

import { deleteCommentAsOwnerAction } from '~/lib/actions/comments';
import styles from './CommentDeleteForm.module.css';

interface OwnerDeleteCommentButtonProps {
  commentId: string;
  postSlug: string;
}

export function OwnerDeleteCommentButton({ commentId, postSlug }: OwnerDeleteCommentButtonProps) {
  return (
    <form
      action={deleteCommentAsOwnerAction.bind(null, postSlug, commentId)}
      onSubmit={(event) => {
        if (!window.confirm('이 댓글을 삭제할까요?')) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className={styles.trigger}>
        관리자 삭제
      </button>
    </form>
  );
}
