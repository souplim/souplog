import { Skeleton } from '~/components/ui/skeleton';
import { FeedContainer } from '~/components/post/FeedLayout';
import { PostListSkeleton } from '~/components/post/PostListSkeleton';
import { SearchForm } from '~/components/search/SearchForm';

/** The menu name isn't known until the page resolves, so a bar holds the label's line. */
export default function MenuLoading() {
  return (
    <FeedContainer>
      <Skeleton className="mb-[var(--space-2xs)] h-4 w-12" />
      <SearchForm />
      <PostListSkeleton />
    </FeedContainer>
  );
}
