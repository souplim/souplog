import { PostListSkeleton } from '~/components/post/PostListSkeleton';

export default function MenuLoading() {
  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-section)] sm:px-6">
      <PostListSkeleton />
    </div>
  );
}
