'use client';

import { deletePostAction } from '~/lib/actions/posts';
import styles from './page.module.css';

export function DeletePostButton({ postId }: { postId: string }) {
  return (
    <form
      action={deletePostAction.bind(null, postId)}
      onSubmit={(event) => {
        if (!window.confirm('이 글을 삭제할까요? 되돌릴 수 없습니다.')) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className={styles.deleteButton}>
        삭제
      </button>
    </form>
  );
}
