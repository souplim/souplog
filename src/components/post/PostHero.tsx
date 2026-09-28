import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '~/lib/date';
import { getPostImageUrl } from '~/lib/images';
import type { Post } from '~/lib/supabase/types';
import { Badge } from '~/components/ui/badge';

interface PostHeroProps {
  post: Post;
  menuName?: string;
}

export function PostHero({ post, menuName }: PostHeroProps) {
  return (
    <article className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-10">
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{menuName ?? '최신 글'}</Badge>
          {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
        </div>
        <h2 className="text-[clamp(1.75rem,1.3rem+2vw,3rem)]">
          <Link
            href={`/posts/${post.slug}`}
            className="font-heading transition-colors hover:text-accent-foreground"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
      </div>
      {post.cover_image_path && (
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-foreground/10 shadow-[var(--shadow-raised)]">
          <Image
            src={getPostImageUrl(post.cover_image_path)}
            alt=""
            fill
            sizes="(max-width: 56rem) 100vw, 40vw"
            className="object-cover"
            priority
          />
        </div>
      )}
    </article>
  );
}
