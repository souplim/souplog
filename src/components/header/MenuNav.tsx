'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from 'cn';
import type { NavItem, NavItemKey } from '~/lib/nav-items';
import type { Menu } from '~/lib/supabase/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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

/** Every entry but `posts` is a plain link to a fixed page. */
const PAGE_HREFS: Readonly<Record<Exclude<NavItemKey, 'posts'>, string>> = {
  about: '/about',
  books: '/books',
  stats: '/stats',
  papers: '/papers',
};
const ALL_POSTS_HREF = '/posts';
const MENU_PATH_PREFIX = '/posts/menu/';

function isPageActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The top-level entries come from 메뉴 관리, where the owner names, orders,
 * and hides them. The fixed pages stay plain links; the post categories fold
 * into one dropdown so the row doesn't grow with the number of menus.
 *
 * The entries don't fit beside the logo on a phone, so below `sm` the whole
 * row folds into a single 메뉴 dropdown holding the same links.
 */
export function MenuNav({ navItems, menus }: MenuNavProps) {
  const pathname = usePathname();
  const visibleMenus = menus.filter((menu) => menu.is_visible);
  const visibleItems = navItems.filter((item) => item.isVisible && (item.key !== 'posts' || visibleMenus.length > 0));

  return (
    <nav aria-label="메인 내비게이션" className="min-w-0 flex-1">
      <ul className="hidden items-center gap-5 sm:flex">
        {visibleItems.map((item) => {
          if (item.key === 'posts') {
            return (
              <li key={item.key} className="shrink-0">
                <PostMenuDropdown
                  label={item.label}
                  menus={visibleMenus}
                  pathname={pathname}
                  isActive={isPageActive(pathname, ALL_POSTS_HREF)}
                />
              </li>
            );
          }

          const href = PAGE_HREFS[item.key];
          const isActive = isPageActive(pathname, href);
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

      <div className="sm:hidden">
        <CompactNav items={visibleItems} menus={visibleMenus} pathname={pathname} />
      </div>
    </nav>
  );
}

interface CompactNavProps {
  items: NavItem[];
  menus: Menu[];
  pathname: string;
}

/** The phone layout: one 메뉴 button, with the post categories as a labelled group inside. */
function CompactNav({ items, menus, pathname }: CompactNavProps) {
  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={cn(NAV_ITEM_CLASS, 'group cursor-pointer data-[state=open]:text-foreground')}>
          메뉴
          <ChevronDown
            aria-hidden
            className="size-3.5 transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {items.map((item, index) => {
          if (item.key === 'posts') {
            return (
              <div key={item.key}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {item.label}
                </DropdownMenuLabel>
                <PostMenuItems menus={menus} pathname={pathname} />
                {index < items.length - 1 && <DropdownMenuSeparator />}
              </div>
            );
          }

          const href = PAGE_HREFS[item.key];
          return (
            <MenuLinkItem key={item.key} href={href} label={item.label} isCurrent={isPageActive(pathname, href)} />
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MenuLinkItemProps {
  href: string;
  label: string;
  isCurrent: boolean;
}

function MenuLinkItem({ href, label, isCurrent }: MenuLinkItemProps) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={href}
        aria-current={isCurrent ? 'page' : undefined}
        className={cn(isCurrent && 'font-semibold text-foreground')}
      >
        {label}
      </Link>
    </DropdownMenuItem>
  );
}

/** 전체 글, then each visible category — shared by the wide dropdown and the phone menu. */
function PostMenuItems({ menus, pathname }: { menus: Menu[]; pathname: string }) {
  return (
    <>
      <MenuLinkItem href={ALL_POSTS_HREF} label="전체 글" isCurrent={pathname === ALL_POSTS_HREF} />
      {menus.map((menu) => {
        const href = `${MENU_PATH_PREFIX}${menu.slug}`;
        return <MenuLinkItem key={menu.id} href={href} label={menu.name} isCurrent={pathname === href} />;
      })}
    </>
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
          className={cn(
            NAV_ITEM_CLASS,
            'group cursor-pointer data-[state=open]:text-foreground',
            isActive && ACTIVE_NAV_ITEM_CLASS,
          )}
        >
          {label}
          <ChevronDown
            aria-hidden
            className="size-3.5 transition-transform duration-[var(--duration-fast)] group-data-[state=open]:rotate-180"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        <MenuLinkItem href={ALL_POSTS_HREF} label="전체 글" isCurrent={pathname === ALL_POSTS_HREF} />
        <DropdownMenuSeparator />
        {menus.map((menu) => {
          const href = `${MENU_PATH_PREFIX}${menu.slug}`;
          return <MenuLinkItem key={menu.id} href={href} label={menu.name} isCurrent={pathname === href} />;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
