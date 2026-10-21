'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { logout } from '~/lib/actions/auth';
import { ADMIN_LINKS } from '~/components/header/adminLinks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

const AVATAR_SIZE = 32;

interface AdminMenuProps {
  /** The About page's name — labels the menu so it reads as "signed in as". */
  name: string | null;
  /** Public URL of the About page's profile photo, or `null` to show a plain icon. */
  avatarUrl: string | null;
}

/**
 * Every owner-only action behind one profile button at the header's right
 * edge — visitors never see it, and the nav keeps the full width on a phone.
 */
export function AdminMenu({ name, avatarUrl }: AdminMenuProps) {
  const logoutFormRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="관리자 메뉴"
          className="relative ml-1 flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-accent text-accent-foreground ring-1 ring-border outline-none transition-shadow duration-[var(--duration-fast)] hover:ring-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:ring-foreground/40"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill sizes={`${AVATAR_SIZE}px`} className="object-cover" />
          ) : (
            <UserRound className="size-4" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
          {name ? `${name} · 관리자` : '관리자'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ADMIN_LINKS.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href}>{link.label}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* Submitting from onSelect (instead of nesting a submit button in the
            item) keeps the form alive until the request is sent — the menu
            closes itself only after the action has been handed off. */}
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logoutFormRef.current?.requestSubmit();
          }}
        >
          로그아웃
        </DropdownMenuItem>
        <form ref={logoutFormRef} action={logout} className="hidden" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
