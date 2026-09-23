import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import styles from './Footer.module.css';

export async function Footer() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span>© {new Date().getFullYear()} souplog</span>
        {!user && (
          <Link href="/login" className={styles.loginLink}>
            로그인
          </Link>
        )}
      </div>
    </footer>
  );
}
