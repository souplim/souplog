'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from 'cn';
import type { NavItem } from '~/lib/nav-items';
import type { Menu } from '~/lib/supabase/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface MenuNavProps {
  navItems: NavItem[];
  menus: Menu[];
}

const NAV_ITEM_CLASS =
  'inline-flex h-9 items-center gap-1 rounded-xs text-sm whitespace-nowrap text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';
const ACTIVE_NAV_ITEM_CLASS = 'font-semibold text-foreground';

const ABOUT_HREF = '/about';
const BOOKS_HREF = '/books';
const ALL_POSTS_HREF = '/';
const MENU_PATH_PREFIX = '/menu/';

/**
 * The top-level entries come from 메뉴 관리, where the owner names, orders,
 * and hides them. About and the bookshelf are fixed pages, so they stay plain
 * links; the post categories fold into one dropdown so the nav keeps at most
 * three entries no matter how many menus exist.
 */
export function MenuNav({ navItems, menus }: MenuNavProps) {
  const pathname = usePathname();
  const visibleMenus = menus.filter((menu) => menu.is_visible);

  return (
    <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
      <ul className="flex items-center gap-5">
        {navItems
          .filter((item) => item.isVisible)
          .map((item) => {
            if (item.key === 'posts') {
              if (visibleMenus.length === 0) return null;
              return (
                <li key={item.key} className="shrink-0">
                  <PostMenuDropdown
                    label={item.label}
                    menus={visibleMenus}
                    pathname={pathname}
                    isActive={pathname.startsWith(MENU_PATH_PREFIX)}
                  />
                </li>
              );
            }

            const href = item.key === 'about' ? ABOUT_HREF : BOOKS_HREF;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={item.key} className="shrink-0">
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(NAV_ITEM_CLASS, isActive && ACTIVE_NAV_ITEM_CLASS)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}

interface PostMenuDropdownProps {
  label: string;
  menus: Menu[];
  pathname: string;
  isActive: boolean;
}

function PostMenuDropdown({ label, menus, pathname, isActive }: PostMenuDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(NAV_ITEM_CLASS, 'group cursor-pointer data-[state=open]:text-foreground', isActive && ACTIVE_NAV_ITEM_CLASS)}
        >
          {label}
          <ChevronDown
            aria-hidden
            className="size-3.5 transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <DropdownMenuItem asChild>
          <Link
            href={ALL_POSTS_HREF}
            aria-current={pathname === ALL_POSTS_HREF ? 'page' : undefined}
            className={cn(pathname === ALL_POSTS_HREF && 'font-semibold text-foreground')}
          >
            전체 글
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {menus.map((menu) => {
          const href = `${MENU_PATH_PREFIX}${menu.slug}`;
          const isCurrent = pathname === href;
          return (
            <DropdownMenuItem key={menu.id} asChild>
              <Link
                href={href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(isCurrent && 'font-semibold text-foreground')}
              >
                {menu.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
