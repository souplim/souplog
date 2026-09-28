import Link from 'next/link';
import { formatDate } from '~/lib/date';
import type { Post } from '~/lib/supabase/types';
import { Badge } from '~/components/ui/badge';

interface PostListItemProps {
  post: Post;
  menuName?: string;
}

export function PostListItem({ post, menuName }: PostListItemProps) {
  return (
    <article className="group grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-1 py-5 transition-[transform,opacity] duration-200 ease-out hover:-translate-y-0.5">
      <time
        className="text-sm tabular-nums text-muted-foreground"
        dateTime={post.published_at ?? undefined}
      >
        {post.published_at ? formatDate(post.published_at) : '미발행'}
      </time>
      <div className="col-start-2">
        <h3>
          <Link
            href={`/posts/${post.slug}`}
            className="font-heading text-xl transition-colors group-hover:text-accent-foreground"
          >
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-1.5 text-muted-foreground">{post.excerpt}</p>}
        {menuName && (
          <Badge variant="secondary" className="mt-2">
            {menuName}
          </Badge>
        )}
      </div>
    </article>
  );
}
