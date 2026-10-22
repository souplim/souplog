import { Skeleton } from '~/components/ui/skeleton';

/** Follows `AboutHero`'s name, intro and story column, so the first screen swaps in without a shift. */
export default function AboutLoading() {
  return (
    <div role="status" className="pt-[var(--space-xl)] pb-[var(--space-section)]">
      <span className="sr-only">소개를 불러오는 중입니다.</span>
      <div className="mx-auto max-w-[var(--page-width)] px-4 sm:px-6">
        <div className="max-w-[var(--content-width)]">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="mt-[var(--space-2xs)] h-11 w-48" />
          <Skeleton className="mt-[var(--space-2xs)] h-6 w-full max-w-sm" />
          <Skeleton className="mt-[var(--space-sm)] h-4 w-40" />
          <div className="mt-[var(--space-lg)] space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
