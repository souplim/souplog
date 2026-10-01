import Image from 'next/image';
import { getPostImageUrl, type PostImage } from '~/lib/images';

/**
 * Photos are laid out at their own aspect ratio, capped by the text column's
 * width and by a share of the viewport height — a tall portrait shot then
 * reads at a sane size instead of running past the fold, and nothing is
 * cropped to fit a fixed box.
 */
const IMAGE_SIZES = '(max-width: 48rem) 100vw, 42rem';

/** Fallback box for images uploaded before intrinsic sizes were recorded. */
const UNKNOWN_SIZE_ASPECT = 'aspect-[3/2]';

interface PostGalleryProps {
  images: PostImage[];
  /** Used to describe the photos when they aren't purely decorative. */
  title: string;
}

export function PostGallery({ images, title }: PostGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {images.map((image, index) => (
        <PostGalleryImage
          key={image.path}
          image={image}
          alt={images.length > 1 ? `${title} 사진 ${index + 1}` : title}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

interface PostGalleryImageProps {
  image: PostImage;
  alt: string;
  isFirst: boolean;
}

function PostGalleryImage({ image, alt, isFirst }: PostGalleryImageProps) {
  const src = getPostImageUrl(image.path);
  // Only the lead photo is worth loading ahead of the fold; the rest wait.
  const loading = isFirst ? 'eager' : 'lazy';
  const fetchPriority = isFirst ? 'high' : 'auto';

  if (image.width === undefined || image.height === undefined) {
    return (
      <div className={`relative ${UNKNOWN_SIZE_ASPECT} w-full overflow-hidden rounded-xl bg-muted`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={IMAGE_SIZES}
          className="object-contain"
          loading={loading}
          fetchPriority={fetchPriority}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={image.width}
      height={image.height}
      sizes={IMAGE_SIZES}
      className="mx-auto h-auto max-h-[70svh] w-auto max-w-full rounded-lg object-contain ring-1 ring-border"
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
}
