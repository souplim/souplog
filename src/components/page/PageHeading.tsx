import type { ReactNode } from 'react';

interface PageHeadingProps {
  children: ReactNode;
}

/** The small accent label above a page title ("About", a menu name, a book's status). */
export function PageEyebrow({ children }: PageHeadingProps) {
  return <p className="mb-[var(--space-2xs)] text-xs font-semibold text-accent-foreground">{children}</p>;
}

/** The headline of a public page — posts, About, the bookshelf, a book. */
export function PageTitle({ children }: PageHeadingProps) {
  return (
    <h1 className="font-heading text-[length:var(--text-display)] tracking-[var(--tracking-display)] text-balance">
      {children}
    </h1>
  );
}

/** Admin pages are tools, not reading — their title sits a step below the public display size. */
export function AdminPageTitle({ children }: PageHeadingProps) {
  return <h1 className="mb-[var(--space-lg)] font-heading text-[length:var(--text-title)]">{children}</h1>;
}
