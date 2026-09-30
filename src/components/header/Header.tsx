import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { logout } from '~/lib/actions/auth';
import { getMenus } from '~/lib/menus';
import { MenuNav } from '~/components/header/MenuNav';
import { AdminMenu } from '~/components/header/AdminMenu';
import { ADMIN_LINKS } from '~/components/header/adminLinks';
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
      <div className="mx-auto flex h-16 max-w-[var(--page-width)] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="font-heading text-lg font-bold tracking-tight text-foreground">
          souplog
        </Link>

        <MenuNav menus={menus} />

        {/* shrink-0: the admin actions must never eat into the nav's width —
            below md they collapse into a single icon so the menus stay
            readable on a phone. */}
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          {user ? (
            <>
              <div className="hidden items-center gap-1 md:flex">
                {ADMIN_LINKS.map((link) => (
                  <Button key={link.href} variant="ghost" size="sm" className="shrink-0" asChild>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                <form action={logout} className="shrink-0">
                  <Button variant="ghost" size="sm" type="submit">
                    로그아웃
                  </Button>
                </form>
              </div>
              <AdminMenu className="md:hidden" />
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
