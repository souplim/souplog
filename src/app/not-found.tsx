import Link from 'next/link';
import styles from './page.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <p className={styles.empty}>
        페이지를 찾을 수 없습니다.
        <br />
        <Link href="/">홈으로 돌아가기</Link>
      </p>
    </div>
  );
}
