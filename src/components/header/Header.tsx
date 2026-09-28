import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { logout } from '~/lib/actions/auth';
import { getMenus } from '~/lib/menus';
import { ThemeToggle } from '~/components/theme/ThemeToggle';
import { Button } from '~/components/ui/button';

export async function Header() {
  // Header renders on every page, including the login page a visitor would
  // need during a Supabase outage — a menu-query failure here must not take
  // the whole site down, so it degrades to an empty nav instead of throwing.
  const [menusResult, userResult] = await Promise.allSettled([getMenus(), getCurrentUser()]);
  const menus = menusResult.status === 'fulfilled' ? menusResult.value : [];
  const user = userResult.status === 'fulfilled' ? userResult.value : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--page-width)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight text-foreground">
          souplog
        </Link>

        <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
          <ul className="no-scrollbar flex items-center gap-1 overflow-x-auto">
            {menus.map((menu) => (
              <li key={menu.id} className="shrink-0">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/menu/${menu.slug}`}>{menu.name}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">관리자</Link>
              </Button>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit">
                  로그아웃
                </Button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
