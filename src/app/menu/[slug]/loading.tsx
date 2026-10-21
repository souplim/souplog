import { FeedContainer, FeedTitle } from '~/components/post/FeedLayout';
import { PostListSkeleton } from '~/components/post/PostListSkeleton';
import { SearchForm } from '~/components/search/SearchForm';

/** The menu name isn't known until the page resolves, so `FeedTitle` holds its line with a bar. */
export default function MenuLoading() {
  return (
    <FeedContainer>
      <SearchForm />
      <FeedTitle />
      <PostListSkeleton />
    </FeedContainer>
  );
}
