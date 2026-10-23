import Image from 'next/image';
import { cn } from 'cn';
import { getPostImageUrl, type PostImage } from '~/lib/images';

interface BookCoverProps {
  title: string;
  cover: PostImage | null;
  /** `next/image` sizes hint — the box's rendered width. */
  sizes: string;
  className?: string;
  isPriority?: boolean;
  /**
   * Private content skips the optimizer: it fetches as a visitor, so it can't
   * read these files — the owner's browser loads them from `/media` directly.
   */
  isPublic: boolean;
}

/**
 * A 2:3 book cover. Books without a cover get a tinted plane set with the
 * title, so a row of covers lines up either way.
 */
export function BookCover({ title, cover, sizes, className, isPriority = false, isPublic }: BookCoverProps) {
  return (
    <div
      className={cn(
        'relative aspect-[2/3] overflow-hidden rounded-xs bg-accent shadow-[var(--shadow-cover)] ring-1 ring-border',
        className,
      )}
    >
      {cover ? (
        <Image
          src={getPostImageUrl(cover.path)}
          // The title is always printed next to the cover, so it adds nothing for a screen reader.
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          loading={isPriority ? 'eager' : 'lazy'}
          fetchPriority={isPriority ? 'high' : 'auto'}
          unoptimized={!isPublic}
        />
      ) : (
        <div className="flex size-full items-center justify-center p-[12%] select-none" aria-hidden="true">
          <p className="line-clamp-4 text-center font-heading text-[length:var(--text-sm)] leading-[var(--leading-tight)] font-semibold break-keep text-accent-foreground/75">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
