'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { EllipsisVertical } from 'lucide-react';
import { cn } from 'cn';
import { logout } from '~/lib/actions/auth';
import { ADMIN_LINKS } from '~/components/header/adminLinks';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface AdminMenuProps {
  className?: string;
}

export function AdminMenu({ className }: AdminMenuProps) {
  const logoutFormRef = useRef<HTMLFormElement>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="관리 메뉴"
          className={cn('shrink-0', className)}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
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
