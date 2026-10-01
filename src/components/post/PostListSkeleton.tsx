import { cn } from 'cn';
import { Skeleton } from '~/components/ui/skeleton';

/**
 * One entry per placeholder row. The widths vary on purpose — a column of
 * identical bars reads as a broken layout rather than as text that hasn't
 * arrived yet. Four rows is about one screen; the fallback never needs to
 * cover the whole feed.
 *
 * Classes are written out rather than interpolated because Tailwind only sees
 * literal strings in the source.
 */
const ROWS = [
  { title: 'w-[68%]', excerpt: 'w-[92%]', tail: 'w-[41%]' },
  { title: 'w-[52%]', excerpt: 'w-[74%]', tail: 'w-[28%]' },
  { title: 'w-[76%]', excerpt: 'w-[84%]', tail: 'w-[47%]' },
  { title: 'w-[44%]', excerpt: 'w-[66%]', tail: 'w-[33%]' },
];

/**
 * Mirrors `PostListItem`'s rhythm — meta line, title, two excerpt lines inside
 * a `border-b py-6` row — so the real list swaps in without shifting.
 */
export function PostListSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">글 목록을 불러오는 중입니다.</span>
      {ROWS.map((row) => (
        <div key={row.title} className="border-b border-border py-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className={cn('mt-3 h-5', row.title)} />
          <Skeleton className={cn('mt-3.5 h-3.5', row.excerpt)} />
          <Skeleton className={cn('mt-2 h-3.5', row.tail)} />
        </div>
      ))}
    </div>
  );
}
