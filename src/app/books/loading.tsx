import { Skeleton } from '~/components/ui/skeleton';

const SHELF_COVERS = 9;

export default function BooksLoading() {
  return (
    <div role="status" className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <span className="sr-only">책장을 불러오는 중입니다.</span>
      <Skeleton className="mb-[var(--space-2xs)] h-4 w-10" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-[var(--space-sm)] h-5 w-80 max-w-full" />
      {/* Same card as `ShelfSummary`: the counts and year, then the chart. */}
      <div className="mt-[var(--space-xl)] rounded-xl border border-border bg-card p-[var(--space-md)]">
        <div className="mb-[var(--space-md)] flex justify-between gap-[var(--space-sm)]">
          <Skeleton className="h-11 w-52 max-w-full" />
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="mt-[var(--space-xl)] flex gap-3 overflow-hidden pt-3 sm:gap-4">
        {Array.from({ length: SHELF_COVERS }, (_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-[5.5rem] shrink-0 rounded-b-none sm:w-28" />
        ))}
      </div>
    </div>
  );
}
