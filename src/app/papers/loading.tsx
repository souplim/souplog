import { Skeleton } from '~/components/ui/skeleton';

/** Ten keywords per field, two fields; the bar widths vary like real keywords do. */
const KEYWORD_WIDTHS = ['w-24', 'w-16', 'w-20', 'w-28', 'w-14'];
const FIELD_KEYWORD_WIDTHS = [0, 1].map((column) =>
  Array.from({ length: 10 }, (_, index) => KEYWORD_WIDTHS[(index + column * 2) % KEYWORD_WIDTHS.length]),
);

/** Follows `page.tsx`'s header and the two keyword cards, so they swap in without a shift. */
export default function PapersLoading() {
  return (
    <div role="status">
      <span className="sr-only">연구동향을 불러오는 중입니다.</span>
      <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
        <div className="max-w-[var(--content-width)]">
          <Skeleton className="mb-[var(--space-2xs)] h-4 w-14" />
          <Skeleton className="h-11 w-56" />
          <Skeleton className="mt-[var(--space-sm)] h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-3/4" />
        </div>

        <Skeleton className="mt-[var(--space-xl)] h-6 w-52" />
        <Skeleton className="mt-[var(--space-3xs)] h-4 w-11/12" />
        <div className="mt-[var(--space-md)] grid gap-[var(--space-md)] sm:grid-cols-2">
          {FIELD_KEYWORD_WIDTHS.map((widths, column) => (
            <div key={column} className="rounded-xl border border-border bg-card p-[var(--space-md)]">
              <Skeleton className="h-3 w-12" />
              <div className="mt-[var(--space-2xs)]">
                {widths.map((width, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-[var(--space-sm)] border-b border-border py-2 last:border-b-0 last:pb-0"
                  >
                    <Skeleton className="h-3 w-5 shrink-0" />
                    <Skeleton className={`h-4 ${width}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="mt-[var(--space-sm)] h-3 w-40" />
      </div>
    </div>
  );
}
