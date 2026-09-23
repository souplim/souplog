'use client';

import { useActionState, useState } from 'react';
import { deleteCommentAction } from '~/lib/actions/comments';
import styles from './CommentDeleteForm.module.css';

interface CommentDeleteFormProps {
  commentId: string;
  postSlug: string;
}

export function CommentDeleteForm({ commentId, postSlug }: CommentDeleteFormProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(deleteCommentAction.bind(null, postSlug), undefined);

  if (!open) {
    return (
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        삭제
      </button>
    );
  }

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="commentId" value={commentId} />
      <input
        className={styles.input}
        name="password"
        type="password"
        placeholder="비밀번호"
        maxLength={72}
        required
        autoFocus
      />
      <button type="submit" className={styles.confirm} disabled={pending}>
        {pending ? '삭제 중…' : '확인'}
      </button>
      <button type="button" className={styles.trigger} onClick={() => setOpen(false)}>
        취소
      </button>
      {state?.error && <span className={styles.error}>{state.error}</span>}
    </form>
  );
}
