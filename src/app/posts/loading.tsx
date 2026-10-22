import { Skeleton } from '~/components/ui/skeleton';
import { FeedContainer, FeedHeading } from '~/components/post/FeedLayout';
import { PostListSkeleton } from '~/components/post/PostListSkeleton';
import { SearchForm } from '~/components/search/SearchForm';

/**
 * Container matches `page.tsx` exactly, heading included — the heading is real
 * text either way, so rendering it here means only the rows swap.
 */
export default function PostsLoading() {
  return (
    <FeedContainer>
      <Skeleton className="mb-[var(--space-2xs)] h-4 w-12" />
      <SearchForm />
      <FeedHeading>최근 글</FeedHeading>
      <PostListSkeleton />
    </FeedContainer>
  );
}
