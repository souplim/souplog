'use client';

import { useEffect } from 'react';
import styles from './page.module.css';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.page}>
      <p className={styles.empty}>
        문제가 발생했습니다.
        <br />
        <button type="button" onClick={reset} className={styles.retryButton}>
          다시 시도
        </button>
      </p>
    </div>
  );
}
