import Link from 'next/link';
import { getCurrentUser } from '~/lib/auth';
import { getMenus, getNavItems } from '~/lib/menus';
import { DEFAULT_NAV_ITEMS } from '~/lib/nav-items';
import { getProfile } from '~/lib/profile';
import { MenuNav } from '~/components/header/MenuNav';
import { AdminMenu } from '~/components/header/AdminMenu';
import { ThemeToggle } from '~/components/theme/ThemeToggle';

export async function Header() {
  // Header renders on every page, including the login page a visitor would
  // need during a Supabase outage — a menu-query failure here must not take
  // the whole site down, so it degrades to an empty nav instead of throwing.
  // The top-level entries fall back to their defaults the same way.
  //
  // Only the owner sees the profile button, so visitors skip that query —
  // chained off the auth check rather than awaited after the batch, so it
  // overlaps the menu queries instead of waiting behind them. Same
  // degrade-don't-throw rule: a failure just falls back to the icon.
  const userPromise = getCurrentUser().catch(() => null);
  const profilePromise = userPromise.then((user) => (user ? getProfile().catch(() => null) : null));
  const [menus, navItems, user, profile] = await Promise.all([
    getMenus().catch(() => []),
    getNavItems().catch(() => [...DEFAULT_NAV_ITEMS]),
    userPromise,
    profilePromise,
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[var(--page-width)] items-center justify-between gap-4 px-4 sm:gap-8 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-heading text-[1.0625rem] font-semibold tracking-[-0.03em] text-foreground"
        >
          souplog
        </Link>

        <MenuNav navItems={navItems} menus={menus} />

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          {user ? <AdminMenu name={profile?.name || null} avatar={profile?.avatar ?? null} /> : null}
        </div>
      </div>
    </header>
  );
}
