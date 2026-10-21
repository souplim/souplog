import { Skeleton } from '~/components/ui/skeleton';

const SHELF_COVERS = 9;

export default function BooksLoading() {
  return (
    <div role="status" className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <span className="sr-only">책장을 불러오는 중입니다.</span>
      <Skeleton className="mb-3 h-3 w-16" />
      <Skeleton className="mb-[var(--space-md)] h-10 w-28" />
      <Skeleton className="h-28 w-full" />
      <div className="mt-[var(--space-xl)] flex gap-3 overflow-hidden pt-3 sm:gap-4">
        {Array.from({ length: SHELF_COVERS }, (_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-[5.5rem] shrink-0 rounded-b-none sm:w-28" />
        ))}
      </div>
    </div>
  );
}
