import type { ReactNode } from 'react';

interface PageHeadingProps {
  children: ReactNode;
}

interface PageEyebrowProps extends PageHeadingProps {
  /** `h1` when the page has no visible title of its own and the label names the page (the feed, a menu page). */
  as?: 'p' | 'h1';
}

/** The small accent label above a page title ("About", a menu name, a book's status). */
export function PageEyebrow({ children, as: Tag = 'p' }: PageEyebrowProps) {
  return <Tag className="mb-[var(--space-2xs)] text-xs font-semibold text-accent-foreground">{children}</Tag>;
}

/** The headline of a public page — posts, About, the bookshelf, a book. */
export function PageTitle({ children }: PageHeadingProps) {
  return (
    // break-keep: Korean otherwise wraps mid-word; wrap-break-word keeps a long unspaced title from overflowing.
    <h1 className="font-heading text-[length:var(--text-display)] tracking-[var(--tracking-display)] text-balance break-keep wrap-break-word">
      {children}
    </h1>
  );
}

/** Admin pages are tools, not reading — their title sits a step below the public display size. */
export function AdminPageTitle({ children }: PageHeadingProps) {
  return <h1 className="mb-[var(--space-lg)] font-heading text-[length:var(--text-title)]">{children}</h1>;
}
