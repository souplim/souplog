import { PostListSkeleton } from '~/components/post/PostListSkeleton';
import { SearchForm } from '~/components/search/SearchForm';

export default function MenuLoading() {
  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 pt-[var(--space-md)] pb-[var(--space-section)] sm:px-6 sm:pt-[var(--space-lg)]">
      <SearchForm />
      <PostListSkeleton />
    </div>
  );
}
