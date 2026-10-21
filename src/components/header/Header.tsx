import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { getMenus } from '~/lib/menus';
import { getProfile } from '~/lib/profile';
import { MenuNav } from '~/components/header/MenuNav';
import { AdminMenu } from '~/components/header/AdminMenu';
import { ThemeToggle } from '~/components/theme/ThemeToggle';

export async function Header() {
  // Header renders on every page, including the login page a visitor would
  // need during a Supabase outage — a menu-query failure here must not take
  // the whole site down, so it degrades to an empty nav instead of throwing.
  const [menusResult, userResult] = await Promise.allSettled([getMenus(), getCurrentUser()]);
  const menus = menusResult.status === 'fulfilled' ? menusResult.value : [];
  const user = userResult.status === 'fulfilled' ? userResult.value : null;
  // Only the owner sees the profile button, so visitors skip this query. Same
  // degrade-don't-throw rule as above: a failure just falls back to the icon.
  const profile = user ? await getProfile().catch(() => null) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--page-width)] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6">
        <Link href="/" className="shrink-0 font-heading text-[1.0625rem] font-semibold tracking-[-0.03em] text-foreground">
          souplog
        </Link>

        <MenuNav menus={menus} />

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          {user ? <AdminMenu name={profile?.name || null} avatar={profile?.avatar ?? null} /> : null}
        </div>
      </div>
    </header>
  );
}
