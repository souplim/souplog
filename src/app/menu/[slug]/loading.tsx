import { FeedContainer } from '~/components/post/FeedLayout';
import { PostListSkeleton } from '~/components/post/PostListSkeleton';
import { SearchForm } from '~/components/search/SearchForm';

export default function MenuLoading() {
  return (
    <FeedContainer>
      <SearchForm />
      <PostListSkeleton />
    </FeedContainer>
  );
}
