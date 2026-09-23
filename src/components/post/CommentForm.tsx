'use client';

import { useActionState } from 'react';
import { createCommentAction } from '~/lib/actions/comments';
import styles from './CommentForm.module.css';

interface CommentFormProps {
  postId: string;
  postSlug: string;
}

export function CommentForm({ postId, postSlug }: CommentFormProps) {
  const [state, formAction, pending] = useActionState(createCommentAction.bind(null, postSlug), undefined);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="postId" value={postId} />
      <div className={styles.row}>
        <input className={styles.input} name="authorName" placeholder="닉네임" maxLength={40} required />
        <input
          className={styles.input}
          name="password"
          type="password"
          placeholder="비밀번호 (삭제용)"
          maxLength={72}
          required
        />
      </div>
      <textarea
        className={styles.textarea}
        name="content"
        placeholder="댓글을 남겨보세요"
        maxLength={2000}
        rows={3}
        required
      />
      {state?.error && <p className={styles.error}>{state.error}</p>}
      <button type="submit" className={styles.submit} disabled={pending}>
        {pending ? '등록 중…' : '댓글 등록'}
      </button>
    </form>
  );
}
