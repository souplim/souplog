import { PostListSkeleton } from '~/components/post/PostListSkeleton';
import { SearchForm } from '~/components/search/SearchForm';

/**
 * Container matches `page.tsx` exactly, heading included — the heading is real
 * text either way, so rendering it here means only the rows swap.
 *
 * Every sibling segment that isn't the feed (`/login`, `/admin`) carries its
 * own `loading.tsx`; without those this file would be their fallback too.
 */
export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 pt-[var(--space-md)] pb-[var(--space-section)] sm:px-6 sm:pt-[var(--space-lg)]">
      <SearchForm />
      <h2 className="mb-4 text-xs font-normal tracking-normal text-muted-foreground">최근 글</h2>
      <PostListSkeleton />
    </div>
  );
}
