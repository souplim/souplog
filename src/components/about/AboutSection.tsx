import type { ReactNode } from 'react';

interface AboutSectionProps {
  id: string;
  eyebrow: string;
  heading: string;
  children: ReactNode;
  /** Sits at the heading's far end — a "전체 보기" link. */
  action?: ReactNode;
}

/**
 * One band of the About landing page. The band itself spans the window so the
 * page can alternate its background (see the wrapper in `app/about/page.tsx`);
 * the content keeps to the page width.
 */
export function AboutSection({ id, eyebrow, heading, children, action }: AboutSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section aria-labelledby={headingId} className="py-[var(--space-section)]">
      <div className="mx-auto max-w-[var(--page-width)] px-4 sm:px-6">
        <header className="mb-[var(--space-lg)] flex items-end justify-between gap-[var(--space-sm)]">
          <div className="min-w-0">
            <p className="mb-[var(--space-2xs)] text-xs font-semibold text-accent-foreground">{eyebrow}</p>
            <h2
              id={headingId}
              className="font-heading text-[length:var(--text-title)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-balance"
            >
              {heading}
            </h2>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
