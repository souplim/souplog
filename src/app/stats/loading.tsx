import { Skeleton } from '~/components/ui/skeleton';

const CARD_COUNT = 6;

/** Follows `page.tsx`'s header and two-column rule grid, so the cards swap in without a shift. */
export default function StatsLoading() {
  return (
    <div role="status" className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <span className="sr-only">통계를 불러오는 중입니다.</span>
      <div className="max-w-[var(--content-width)]">
        <Skeleton className="mb-[var(--space-2xs)] h-4 w-10" />
        <Skeleton className="h-11 w-64" />
        <Skeleton className="mt-[var(--space-sm)] h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-3/4" />
      </div>

      <div className="mt-[var(--space-xl)] grid gap-x-[var(--space-xl)] sm:grid-cols-2">
        {Array.from({ length: CARD_COUNT }, (_, index) => (
          <div key={index} className="border-t border-border pt-[var(--space-md)] pb-[var(--space-lg)]">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-[var(--space-3xs)] h-4 w-4/5" />
            <Skeleton className="mt-[var(--space-md)] h-7 w-24" />
            <Skeleton className="mt-[var(--space-sm)] h-44 w-full" />
            <Skeleton className="mt-[var(--space-md)] h-3 w-36" />
          </div>
        ))}
      </div>
    </div>
  );
}
