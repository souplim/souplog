'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from 'cn';
import type { Menu } from '~/lib/supabase/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface MenuNavProps {
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
 * About and the bookshelf are fixed pages, so they stay plain links; the
 * owner-managed menus are all post categories, so they fold into one "게시글"
 * dropdown and the nav keeps three entries no matter how many menus exist.
 */
export function MenuNav({ menus }: MenuNavProps) {
  const pathname = usePathname();
  const isAboutActive = pathname === ABOUT_HREF;
  const isBooksActive = pathname === BOOKS_HREF || pathname.startsWith(`${BOOKS_HREF}/`);
  const isPostsActive = pathname.startsWith(MENU_PATH_PREFIX);

  return (
    <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
      <ul className="flex items-center gap-5">
        <li className="shrink-0">
          <Link
            href={ABOUT_HREF}
            aria-current={isAboutActive ? 'page' : undefined}
            className={cn(NAV_ITEM_CLASS, isAboutActive && ACTIVE_NAV_ITEM_CLASS)}
          >
            About
          </Link>
        </li>
        {menus.length > 0 ? (
          <li className="shrink-0">
            <PostMenuDropdown menus={menus} pathname={pathname} isActive={isPostsActive} />
          </li>
        ) : null}
        <li className="shrink-0">
          <Link
            href={BOOKS_HREF}
            aria-current={isBooksActive ? 'page' : undefined}
            className={cn(NAV_ITEM_CLASS, isBooksActive && ACTIVE_NAV_ITEM_CLASS)}
          >
            책장
          </Link>
        </li>
      </ul>
    </nav>
  );
}

interface PostMenuDropdownProps {
  menus: Menu[];
  pathname: string;
  isActive: boolean;
}

function PostMenuDropdown({ menus, pathname, isActive }: PostMenuDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(NAV_ITEM_CLASS, 'group cursor-pointer data-[state=open]:text-foreground', isActive && ACTIVE_NAV_ITEM_CLASS)}
        >
          게시글
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
