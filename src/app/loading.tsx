import { FeedContainer, FeedHeading } from '~/components/post/FeedLayout';
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
    <FeedContainer>
      <SearchForm />
      <FeedHeading>최근 글</FeedHeading>
      <PostListSkeleton />
    </FeedContainer>
  );
}
