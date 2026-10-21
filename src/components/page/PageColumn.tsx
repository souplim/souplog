import type { ReactNode } from 'react';
import { cn } from '~/lib/utils';

interface PageColumnProps {
  children: ReactNode;
  /** Vertical padding for the page — the column only owns width and side gutters. */
  className?: string;
}

/**
 * The reading-width column. The gutter lives on the page-width outer box so the
 * inner column gets the full `--content-width`; putting both on one box would
 * subtract the gutter and leave forms narrower than the posts they edit.
 */
export function PageColumn({ children, className }: PageColumnProps) {
  return (
    <div className={cn('mx-auto max-w-[var(--page-width)] px-4 sm:px-6', className)}>
      <div className="mx-auto w-full max-w-[var(--content-width)]">{children}</div>
    </div>
  );
}
