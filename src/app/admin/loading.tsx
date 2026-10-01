import { Skeleton } from '~/components/ui/skeleton';

/**
 * Deliberately generic: the admin pages don't share a container (the post
 * editor runs full-bleed), and this only has to stand in for the owner for a
 * moment. Its real job is keeping the root feed skeleton out of `/admin/*`.
 */
export default function AdminLoading() {
  return (
    <div role="status" className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <span className="sr-only">관리 화면을 불러오는 중입니다.</span>
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="space-y-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-[72%]" />
      </div>
    </div>
  );
}
