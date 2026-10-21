import { Skeleton } from '~/components/ui/skeleton';

/** Spine heights vary on purpose — a row of equal bars reads as a broken chart, not a shelf. */
const SPINES = ['h-36', 'h-44', 'h-40', 'h-48', 'h-36', 'h-44', 'h-40', 'h-38'];

export default function BooksLoading() {
  return (
    <div role="status" className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <span className="sr-only">책장을 불러오는 중입니다.</span>
      <Skeleton className="mb-3 h-3 w-16" />
      <Skeleton className="mb-[var(--space-md)] h-10 w-28" />
      <Skeleton className="h-28 w-full" />
      <div className="mt-[var(--space-xl)] flex items-end gap-1 border-b-[6px] border-[var(--shelf-plank)]">
        {SPINES.map((height, index) => (
          <Skeleton key={index} className={`${height} w-8 rounded-b-none`} />
        ))}
      </div>
    </div>
  );
}
