import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { logout } from '~/lib/actions/auth';
import { getMenus } from '~/lib/menus';
import { ThemeToggle } from '~/components/theme/ThemeToggle';
import styles from './Header.module.css';

export async function Header() {
  // Header renders on every page, including the login page a visitor would
  // need during a Supabase outage — a menu-query failure here must not take
  // the whole site down, so it degrades to an empty nav instead of throwing.
  const [menusResult, userResult] = await Promise.allSettled([getMenus(), getCurrentUser()]);
  const menus = menusResult.status === 'fulfilled' ? menusResult.value : [];
  const user = userResult.status === 'fulfilled' ? userResult.value : null;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.wordmark}>
          souplog
        </Link>

        <nav aria-label="메인 내비게이션" className={styles.nav}>
          <ul className={styles.navList}>
            {menus.map((menu) => (
              <li key={menu.id}>
                <Link href={`/menu/${menu.slug}`}>{menu.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/admin" className={styles.adminLink}>
                관리자
              </Link>
              <form action={logout}>
                <button type="submit" className={styles.logoutButton}>
                  로그아웃
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
