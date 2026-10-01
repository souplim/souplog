import { cn } from 'cn';
import { Skeleton } from '~/components/ui/skeleton';

/** Body placeholder lines, shortest last so the block reads as a paragraph. */
const BODY_LINES = ['w-full', 'w-[96%]', 'w-[88%]', 'w-full', 'w-[72%]'];

/**
 * Mirrors the post page's container, byline-under-title header, and body
 * column. The outer `min-h` matches `posts/[slug]/page.tsx` so the footer
 * doesn't jump up while the post streams in.
 */
export function PostDetailSkeleton() {
  return (
    <div
      role="status"
      className="mx-auto flex min-h-[calc(100dvh-4rem-3.5rem)] max-w-[var(--page-width)] flex-col px-4 py-[var(--space-xl)] sm:px-6"
    >
      <span className="sr-only">글을 불러오는 중입니다.</span>

      <header className="mx-auto mb-8 w-full max-w-[var(--content-width)] border-b border-border pb-7">
        <Skeleton className="mb-2.5 h-3 w-16" />
        {/* Two lines at `--text-display`'s cap height. Full-height bars read as
            image placeholders rather than as a headline. */}
        <Skeleton className="h-7 w-[78%]" />
        <Skeleton className="mt-3 h-7 w-[44%]" />
        <Skeleton className="mt-5 h-3 w-24" />
      </header>

      <div className="mx-auto w-full max-w-[var(--content-width)] space-y-3">
        {BODY_LINES.map((width) => (
          <Skeleton key={width} className={cn('h-4', width)} />
        ))}
      </div>
    </div>
  );
}
