import { PostListSkeleton } from '~/components/post/PostListSkeleton';

/**
 * Container matches `page.tsx` exactly, heading included — the heading is real
 * text either way, so rendering it here means only the rows swap.
 *
 * Every sibling segment that isn't the feed (`/login`, `/admin`) carries its
 * own `loading.tsx`; without those this file would be their fallback too.
 */
export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-[var(--space-section)] sm:px-6">
      <h2 className="mb-2 text-xs font-normal tracking-normal text-muted-foreground">최근 글</h2>
      <PostListSkeleton />
    </div>
  );
}
