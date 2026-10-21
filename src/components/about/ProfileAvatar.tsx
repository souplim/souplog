import Image from 'next/image';
import { cn } from 'cn';
import { getCoverRenderWidth, getPostImageUrl, type PostImage } from '~/lib/images';

interface ProfileAvatarProps {
  avatar: PostImage | null;
  name: string;
  /** Rendered diameter in px — also tells the optimizer which width to serve. */
  size: number;
  className?: string;
}

/** Round profile photo, or the name's first letter on a tinted disc when there is none. */
export function ProfileAvatar({ avatar, name, size, className }: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full bg-accent ring-1 ring-border',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {avatar ? (
        <Image
          src={getPostImageUrl(avatar.path)}
          alt={`${name} 프로필 사진`}
          fill
          sizes={`${getCoverRenderWidth(avatar, size)}px`}
          priority
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center font-heading text-[length:var(--text-display)] font-semibold text-accent-foreground"
        >
          {name.trim().charAt(0) || '?'}
        </span>
      )}
    </div>
  );
}
